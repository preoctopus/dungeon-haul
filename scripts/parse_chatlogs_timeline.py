#!/usr/bin/env python3
"""Parse Dungeon Haul both-sides chatlogs into timeline-data.json for a static viewer.

Reads chatlogs/NN-*.jsonl (01–61) + chatlogs/INDEX.md and writes:
  - chatlogs/timeline-data.json
  - chatlogs/PARSE-REPORT.md
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CHATLOGS = ROOT / "chatlogs"
INDEX_PATH = CHATLOGS / "INDEX.md"
OUT_JSON = CHATLOGS / "timeline-data.json"
OUT_REPORT = CHATLOGS / "PARSE-REPORT.md"

LOCAL_TZ = ZoneInfo("America/New_York")

MAX_TEXT = 8000
MAX_THINKING = 6000
MAX_TOOL_IO = 4000
MAX_SYSTEM = 500
HARD_CAP_BYTES = 40 * 1024 * 1024
TARGET_CAP_BYTES = 25 * 1024 * 1024

AGENT_COLORS = {
    "grok": "#50a0e8",
    "claude": "#f0a040",
    "antigravity": "#e070b0",
    "pi": "#40e0a0",
}

AGENT_LABEL_PREFIX = {
    "grok": "Grok",
    "claude": "Claude",
    "antigravity": "Antigravity",
    "pi": "Pi",
}

# Claude meta types to collapse / skip lightly
CLAUDE_META_TYPES = {
    "mode",
    "permission-mode",
    "file-history-snapshot",
    "file-history-delta",
    "queue-operation",
    "last-prompt",
    "agent-name",
    "ai-title",
    "attachment",
}

# Antigravity tool-like types → tool_call
ANTI_TOOL_TYPES = {
    "RUN_COMMAND",
    "VIEW_FILE",
    "LIST_DIRECTORY",
    "GREP_SEARCH",
    "CODE_ACTION",
    "GENERATE_IMAGE",
    "FIND",
    "INVOKE_SUBAGENT",
    "replace_file_content",
    "REPLACE_FILE_CONTENT",
    "WRITE_TO_FILE",
    "write_to_file",
    "SEARCH_REPLACE",
    "MULTI_REPLACE_FILE_CONTENT",
    "BROWSER_SUBAGENT",
    "NOTIFY_USER",
    "read_url_content",
    "READ_URL_CONTENT",
    "command_status",
    "COMMAND_STATUS",
}

ANTI_META_TYPES = {
    "CHECKPOINT",
    "SYSTEM_MESSAGE",
    "CONVERSATION_HISTORY",
    "ERROR_MESSAGE",
    "GENERIC",
}

USER_QUERY_RE = re.compile(r"<user_query>\s*(.*?)\s*</user_query>", re.DOTALL | re.IGNORECASE)
USER_REQUEST_RE = re.compile(r"<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>", re.DOTALL)
SYSTEM_REMINDER_RE = re.compile(r"<system-reminder>.*?</system-reminder>", re.DOTALL | re.IGNORECASE)
BASE64_RE = re.compile(r"(?:data:[^;]+;base64,)?[A-Za-z0-9+/]{200,}={0,2}")
DIFF_MARKERS = ("\n+++ ", "\n--- ", "\n@@ ", "+++ ", "--- ", "@@ ")

ISSUES: list[str] = []


def log_issue(msg: str) -> None:
    ISSUES.append(msg)


def truncate(s: Optional[str], max_len: int) -> str:
    if s is None:
        return ""
    if not isinstance(s, str):
        s = str(s)
    if len(s) <= max_len:
        return s
    return s[: max_len - 14] + "\n…[truncated]"


def strip_base64(s: str) -> str:
    if not s:
        return s
    if len(s) > 120 and BASE64_RE.search(s):
        return BASE64_RE.sub("[base64 omitted]", s)
    return s


def looks_like_diff(s: str) -> bool:
    if not s or len(s) < 20:
        return False
    hits = sum(1 for m in ("+++", "---", "@@") if m in s)
    return hits >= 2


def summarize_tool_io(value: Any, max_len: int = MAX_TOOL_IO) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        try:
            s = json.dumps(value, ensure_ascii=False, default=str, indent=2)
        except Exception:
            s = str(value)
    else:
        s = str(value)
    s = strip_base64(s)
    if len(s) > max_len * 3:
        # aggressive: first/last 30 lines
        lines = s.splitlines()
        if len(lines) > 60:
            head = "\n".join(lines[:30])
            tail = "\n".join(lines[-30:])
            s = f"{head}\n…[{len(lines)-60} lines omitted]…\n{tail}"
    return truncate(s, max_len)


def tool_entry(
    name: str,
    input_val: Any = None,
    output_val: Any = None,
) -> dict[str, Any]:
    inp = summarize_tool_io(input_val)
    out = summarize_tool_io(output_val)
    is_diff = looks_like_diff(out) or looks_like_diff(inp)
    diff = None
    if is_diff:
        diff = truncate(out if looks_like_diff(out) else inp, MAX_TOOL_IO)
    return {
        "name": name or "unknown",
        "input": inp,
        "output": out,
        "isDiff": is_diff,
        "diff": diff,
    }


def parse_iso_to_epoch(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        # epoch seconds or ms
        v = float(value)
        if v > 1e12:
            v /= 1000.0
        return v
    if not isinstance(value, str):
        return None
    s = value.strip()
    if not s:
        return None
    # numeric string
    if re.fullmatch(r"\d+(\.\d+)?", s):
        return parse_iso_to_epoch(float(s))
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            # treat naive as UTC for antigravity-style, else local? Prefer UTC.
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    except Exception:
        # try common formats
        for fmt in (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M:%S%z",
        ):
            try:
                dt = datetime.strptime(value.strip(), fmt)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=LOCAL_TZ)
                return dt.timestamp()
            except Exception:
                continue
    return None


def epoch_to_label(ts: float) -> str:
    dt = datetime.fromtimestamp(ts, tz=LOCAL_TZ)
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def extract_user_query_text(text: str) -> str:
    """Prefer <user_query> body; strip system-reminder wrappers."""
    if not text:
        return ""
    m = USER_QUERY_RE.search(text)
    if m:
        return m.group(1).strip()
    # strip system reminders
    cleaned = SYSTEM_REMINDER_RE.sub("", text).strip()
    if cleaned and len(cleaned) < len(text) * 0.9:
        return cleaned
    # if almost all system-reminder / boilerplate and huge, truncate hard
    if "<system-reminder>" in text and len(text) > 2000:
        # keep a short note if no real user query
        remainder = SYSTEM_REMINDER_RE.sub("", text).strip()
        if remainder:
            return remainder
        return "[system context reminder]"
    return text


def extract_user_request_text(text: str) -> str:
    if not text:
        return ""
    m = USER_REQUEST_RE.search(text)
    if m:
        return m.group(1).strip()
    # strip ADDITIONAL_METADATA
    text = re.sub(r"<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>", "", text, flags=re.DOTALL)
    return text.strip()


def content_to_text(content: Any) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                t = block.get("type")
                if t == "text":
                    parts.append(str(block.get("text") or ""))
                elif t == "thinking":
                    # not primary text
                    continue
                elif t == "image":
                    parts.append("[image]")
                elif "text" in block:
                    parts.append(str(block.get("text") or ""))
                else:
                    # skip tool blocks here
                    continue
        return "\n".join(p for p in parts if p)
    if isinstance(content, dict):
        if "text" in content:
            return str(content.get("text") or "")
        try:
            return json.dumps(content, ensure_ascii=False, default=str)
        except Exception:
            return str(content)
    return str(content)


def ensure_strictly_increasing(timestamps: list[float]) -> list[float]:
    if not timestamps:
        return timestamps
    out = [timestamps[0]]
    for t in timestamps[1:]:
        if t <= out[-1]:
            t = out[-1] + 0.001
        out.append(t)
    return out


def assign_lanes(sessions: list[dict[str, Any]]) -> int:
    """Greedy interval coloring by start time; lowest free lane."""
    ordered = sorted(range(len(sessions)), key=lambda i: (sessions[i]["startTs"], sessions[i]["id"]))
    # lane_end[lane] = endTs of last assigned session on that lane
    lane_ends: list[float] = []
    for idx in ordered:
        s = sessions[idx]
        start = s["startTs"]
        end = s["endTs"]
        if end < start:
            end = start
            s["endTs"] = end
        placed = False
        for lane, last_end in enumerate(lane_ends):
            if start >= last_end:
                s["lane"] = lane
                lane_ends[lane] = end
                placed = True
                break
        if not placed:
            s["lane"] = len(lane_ends)
            lane_ends.append(end)
    return len(lane_ends)


def parse_index(path: Path) -> list[dict[str, Any]]:
    """Parse INDEX.md table rows into session stubs."""
    sessions: list[dict[str, Any]] = []
    text = path.read_text(encoding="utf-8", errors="replace")
    # | 01 | 2026-07-20 21:43:29 | grok | `...` | `01-grok.jsonl` |
    row_re = re.compile(
        r"^\|\s*(\d+)\s*\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\|\s*(\w+)\s*\|\s*`([^`]*)`\s*\|\s*`([^`]+)`\s*\|",
        re.MULTILINE,
    )
    for m in row_re.finditer(text):
        num = int(m.group(1))
        started = m.group(2)
        agent = m.group(3).lower()
        file_name = m.group(5)
        sid = file_name.replace(".jsonl", "")
        # parse local start
        dt = datetime.strptime(started, "%Y-%m-%d %H:%M:%S").replace(tzinfo=LOCAL_TZ)
        start_ts = dt.timestamp()
        sessions.append(
            {
                "id": sid,
                "file": file_name,
                "agent": agent,
                "label": f"{AGENT_LABEL_PREFIX.get(agent, agent.title())} #{num:02d}",
                "startTs": start_ts,
                "endTs": start_ts,  # filled later
                "lane": 0,
                "color": AGENT_COLORS.get(agent, "#888888"),
                "_num": num,
            }
        )
    if not sessions:
        log_issue("INDEX.md: no sessions parsed")
    return sessions


def make_msg(
    session_id: str,
    agent: str,
    lane: int,
    seq: int,
    ts: float,
    kind: str,
    title: str = "",
    text: str = "",
    thinking: str = "",
    tools: Optional[list[dict]] = None,
    collapsed: Optional[bool] = None,
) -> dict[str, Any]:
    if collapsed is None:
        collapsed = kind in ("thinking", "tool_call", "tool_result", "system", "meta", "other")
    text = truncate(strip_base64(text or ""), MAX_TEXT)
    thinking = truncate(strip_base64(thinking or ""), MAX_THINKING)
    return {
        "id": f"{session_id}-{seq:05d}",
        "sessionId": session_id,
        "agent": agent,
        "lane": lane,
        "ts": float(ts),
        "tsLabel": epoch_to_label(ts),
        "kind": kind,
        "title": title or "",
        "text": text,
        "thinking": thinking,
        "tools": tools or [],
        "collapsedDefault": collapsed,
    }


# ─────────────────────────── Grok ───────────────────────────


def parse_grok(path: Path, session: dict[str, Any]) -> list[dict[str, Any]]:
    agent = "grok"
    sid = session["id"]
    lane = session["lane"]
    raw_rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                raw_rows.append(json.loads(line))
            except json.JSONDecodeError as e:
                log_issue(f"{path.name}:{line_no}: JSON error: {e}")

    # Build intermediate message records without timestamps first
    interim: list[dict[str, Any]] = []
    for row in raw_rows:
        typ = row.get("type") or ""
        if typ == "system":
            text = content_to_text(row.get("content"))
            if len(text) > MAX_SYSTEM:
                text = truncate(text, MAX_SYSTEM)
            interim.append(
                {
                    "kind": "system",
                    "title": "system",
                    "text": text,
                    "thinking": "",
                    "tools": [],
                    "collapsed": True,
                }
            )
        elif typ == "user":
            text = content_to_text(row.get("content"))
            text = extract_user_query_text(text)
            # skip empty pure system-reminder synthetic rows when nothing left
            if not text.strip() or text.strip() == "[system context reminder]":
                # keep short meta for synthetic reminders that had no query
                if row.get("synthetic_reason"):
                    interim.append(
                        {
                            "kind": "meta",
                            "title": "system-reminder",
                            "text": truncate(content_to_text(row.get("content")), 300),
                            "thinking": "",
                            "tools": [],
                            "collapsed": True,
                        }
                    )
                    continue
            interim.append(
                {
                    "kind": "user",
                    "title": "",
                    "text": text,
                    "thinking": "",
                    "tools": [],
                    "collapsed": False,
                }
            )
        elif typ == "reasoning":
            summary = row.get("summary")
            thinking = ""
            if isinstance(summary, list):
                parts = []
                for b in summary:
                    if isinstance(b, dict):
                        parts.append(str(b.get("text") or ""))
                    else:
                        parts.append(str(b))
                thinking = "\n".join(p for p in parts if p)
            elif isinstance(summary, str):
                thinking = summary
            else:
                thinking = content_to_text(row.get("content"))
            interim.append(
                {
                    "kind": "thinking",
                    "title": "reasoning",
                    "text": "",
                    "thinking": thinking,
                    "tools": [],
                    "collapsed": True,
                }
            )
        elif typ == "assistant":
            text = content_to_text(row.get("content"))
            tool_calls = row.get("tool_calls") or []
            tools = []
            for tc in tool_calls:
                if not isinstance(tc, dict):
                    continue
                name = tc.get("name") or tc.get("function", {}).get("name") or "tool"
                args = tc.get("arguments")
                if args is None:
                    args = tc.get("input") or tc.get("args")
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except Exception:
                        pass
                tools.append(tool_entry(name, input_val=args))
            if tools and not text.strip():
                # pure tool call message
                names = ", ".join(t["name"] for t in tools[:4])
                interim.append(
                    {
                        "kind": "tool_call",
                        "title": names,
                        "text": "",
                        "thinking": "",
                        "tools": tools,
                        "collapsed": True,
                    }
                )
            elif tools:
                interim.append(
                    {
                        "kind": "assistant",
                        "title": "",
                        "text": text,
                        "thinking": "",
                        "tools": tools,
                        "collapsed": False,
                    }
                )
            else:
                interim.append(
                    {
                        "kind": "assistant",
                        "title": "",
                        "text": text,
                        "thinking": "",
                        "tools": [],
                        "collapsed": False,
                    }
                )
        elif typ == "tool_result":
            tool_id = row.get("tool_call_id") or ""
            content = row.get("content")
            out = content
            if isinstance(content, list):
                out = content_to_text(content) or summarize_tool_io(content)
            tools = [tool_entry("tool_result", input_val=tool_id, output_val=out)]
            interim.append(
                {
                    "kind": "tool_result",
                    "title": f"tool_result {tool_id[:24]}".strip(),
                    "text": truncate(str(out) if not isinstance(out, (dict, list)) else summarize_tool_io(out), 500),
                    "thinking": "",
                    "tools": tools,
                    "collapsed": True,
                }
            )
        else:
            interim.append(
                {
                    "kind": "other",
                    "title": typ or "other",
                    "text": truncate(json.dumps(row, ensure_ascii=False, default=str)[:1000], 1000),
                    "thinking": "",
                    "tools": [],
                    "collapsed": True,
                }
            )

    # Timestamp assignment: INDEX start → max(start+duration_guess, mtime)
    start_ts = session["startTs"]
    mtime = path.stat().st_mtime
    n = max(len(interim), 1)
    # Prefer span from start to mtime; if mtime before start, use 2s * n
    end_ts = max(mtime, start_ts + max(2.0 * n, 5.0))
    # Even distribution
    if n == 1:
        stamps = [start_ts]
    else:
        span = end_ts - start_ts
        # keep a little room; distribute evenly
        stamps = [start_ts + (span * i / (n - 1)) for i in range(n)]
    stamps = ensure_strictly_increasing(stamps)

    messages: list[dict[str, Any]] = []
    for i, rec in enumerate(interim):
        messages.append(
            make_msg(
                sid,
                agent,
                lane,
                i,
                stamps[i],
                rec["kind"],
                title=rec.get("title") or "",
                text=rec.get("text") or "",
                thinking=rec.get("thinking") or "",
                tools=rec.get("tools") or [],
                collapsed=rec.get("collapsed"),
            )
        )
    if messages:
        session["endTs"] = max(session["endTs"], messages[-1]["ts"])
    else:
        session["endTs"] = max(session["endTs"], mtime)
    return messages


# ─────────────────────────── Claude ───────────────────────────


def parse_claude(path: Path, session: dict[str, Any]) -> list[dict[str, Any]]:
    agent = "claude"
    sid = session["id"]
    lane = session["lane"]
    messages: list[dict[str, Any]] = []
    seq = 0
    last_ts = session["startTs"]

    with path.open(encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as e:
                log_issue(f"{path.name}:{line_no}: JSON error: {e}")
                continue

            typ = row.get("type") or ""
            ts = parse_iso_to_epoch(row.get("timestamp"))
            if ts is None:
                # nested snapshot timestamp
                snap = row.get("snapshot")
                if isinstance(snap, dict):
                    ts = parse_iso_to_epoch(snap.get("timestamp"))
            if ts is None:
                ts = last_ts + 0.001
            if ts <= last_ts:
                ts = last_ts + 0.001
            last_ts = ts

            if typ in CLAUDE_META_TYPES:
                # skip most meta to keep size down; keep a tiny collapsed note only for queue enqueue with content
                if typ == "queue-operation" and row.get("operation") == "enqueue" and row.get("content"):
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "meta",
                            title="queue enqueue",
                            text=str(row.get("content"))[:500],
                            collapsed=True,
                        )
                    )
                    seq += 1
                # skip the rest
                continue

            if typ == "system":
                text = content_to_text(row.get("content") or row.get("message") or row)
                messages.append(
                    make_msg(sid, agent, lane, seq, ts, "system", title="system", text=truncate(text, MAX_SYSTEM), collapsed=True)
                )
                seq += 1
                continue

            if typ in ("user", "assistant") and isinstance(row.get("message"), dict):
                msg = row["message"]
                content = msg.get("content")
                role = msg.get("role") or typ

                if isinstance(content, str):
                    kind = "user" if role == "user" else "assistant"
                    text = content
                    if kind == "user":
                        text = extract_user_query_text(text)
                    # skip empty
                    if not (text or "").strip():
                        continue
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            kind,
                            text=text,
                            collapsed=False,
                        )
                    )
                    seq += 1
                    continue

                if not isinstance(content, list):
                    continue

                # Split content blocks into separate messages by kind for clearer timeline
                text_parts: list[str] = []
                thinking_parts: list[str] = []
                tool_uses: list[dict] = []
                tool_results: list[dict] = []

                for block in content:
                    if not isinstance(block, dict):
                        if isinstance(block, str):
                            text_parts.append(block)
                        continue
                    bt = block.get("type")
                    if bt == "text":
                        text_parts.append(str(block.get("text") or ""))
                    elif bt == "thinking":
                        thinking_parts.append(str(block.get("thinking") or block.get("text") or ""))
                    elif bt in ("tool_use", "server_tool_use"):
                        tool_uses.append(block)
                    elif bt in ("tool_result", "tool_search_tool_result"):
                        tool_results.append(block)
                    elif bt == "image":
                        text_parts.append("[image]")
                    else:
                        # unknown block — light meta
                        text_parts.append(f"[{bt or 'block'}]")

                # Emit thinking first if present
                if thinking_parts:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "thinking",
                            title="thinking",
                            thinking="\n\n".join(thinking_parts),
                            collapsed=True,
                        )
                    )
                    seq += 1
                    ts = last_ts + 0.001
                    last_ts = ts

                if tool_uses:
                    tools = []
                    titles = []
                    for b in tool_uses:
                        name = b.get("name") or "tool"
                        titles.append(name)
                        tools.append(tool_entry(name, input_val=b.get("input")))
                    text = "\n".join(text_parts).strip()
                    if text:
                        messages.append(
                            make_msg(
                                sid,
                                agent,
                                lane,
                                seq,
                                ts,
                                "assistant",
                                text=text,
                                tools=tools,
                                collapsed=False,
                            )
                        )
                    else:
                        messages.append(
                            make_msg(
                                sid,
                                agent,
                                lane,
                                seq,
                                ts,
                                "tool_call",
                                title=", ".join(titles[:4]),
                                tools=tools,
                                collapsed=True,
                            )
                        )
                    seq += 1
                    ts = last_ts + 0.001
                    last_ts = ts
                    text_parts = []  # consumed

                if tool_results:
                    tools = []
                    for b in tool_results:
                        name = "tool_result"
                        out = b.get("content")
                        if isinstance(out, list):
                            out = content_to_text(out) or summarize_tool_io(out)
                        tools.append(
                            tool_entry(
                                name,
                                input_val=b.get("tool_use_id"),
                                output_val=out,
                            )
                        )
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "tool_result",
                            title="tool_result",
                            text=truncate(summarize_tool_io(tools[0]["output"] if tools else ""), 500),
                            tools=tools,
                            collapsed=True,
                        )
                    )
                    seq += 1
                    ts = last_ts + 0.001
                    last_ts = ts

                # leftover text (no tools)
                text = "\n".join(text_parts).strip()
                if text:
                    kind = "user" if role == "user" else "assistant"
                    if kind == "user":
                        text = extract_user_query_text(text)
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            kind,
                            text=text,
                            collapsed=False,
                        )
                    )
                    seq += 1
                continue

            # other types
            if typ:
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        "other",
                        title=typ,
                        text=truncate(json.dumps({k: row[k] for k in list(row)[:8]}, default=str), 800),
                        collapsed=True,
                    )
                )
                seq += 1

    if messages:
        session["endTs"] = max(session["endTs"], messages[-1]["ts"])
    else:
        session["endTs"] = max(session["endTs"], path.stat().st_mtime)
    return messages


# ─────────────────────────── Antigravity ───────────────────────────


def parse_antigravity(path: Path, session: dict[str, Any]) -> list[dict[str, Any]]:
    agent = "antigravity"
    sid = session["id"]
    lane = session["lane"]
    messages: list[dict[str, Any]] = []
    seq = 0
    last_ts = session["startTs"]

    with path.open(encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as e:
                log_issue(f"{path.name}:{line_no}: JSON error: {e}")
                continue

            typ = row.get("type") or ""
            ts = parse_iso_to_epoch(row.get("created_at"))
            if ts is None:
                ts = last_ts + 0.001
            if ts <= last_ts:
                ts = last_ts + 0.001
            last_ts = ts

            if typ == "USER_INPUT":
                text = extract_user_request_text(str(row.get("content") or ""))
                if not text.strip():
                    continue
                messages.append(
                    make_msg(sid, agent, lane, seq, ts, "user", text=text, collapsed=False)
                )
                seq += 1
                continue

            if typ == "PLANNER_RESPONSE":
                text = str(row.get("content") or "").strip()
                tool_calls = row.get("tool_calls") or []
                tools = []
                titles = []
                for tc in tool_calls:
                    if not isinstance(tc, dict):
                        continue
                    name = tc.get("name") or "tool"
                    titles.append(name)
                    args = tc.get("args") or tc.get("arguments") or tc.get("input")
                    tools.append(tool_entry(name, input_val=args))
                if tools and not text:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "tool_call",
                            title=", ".join(titles[:4]),
                            tools=tools,
                            collapsed=True,
                        )
                    )
                elif tools:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "assistant",
                            text=text,
                            tools=tools,
                            collapsed=False,
                        )
                    )
                elif text:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "assistant",
                            text=text,
                            collapsed=False,
                        )
                    )
                else:
                    continue
                seq += 1
                continue

            if typ in ANTI_TOOL_TYPES or typ.upper() in ANTI_TOOL_TYPES:
                content = row.get("content")
                # tool result style: content is output; try to pull summary from prior naming
                name = typ
                # Heuristic: content often starts with Created At / command output
                tools = [tool_entry(name, input_val=None, output_val=content)]
                # If content looks empty, skip
                out_s = summarize_tool_io(content)
                if not out_s.strip():
                    continue
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        "tool_call",
                        title=name,
                        text=truncate(out_s, 500),
                        tools=tools,
                        collapsed=True,
                    )
                )
                seq += 1
                continue

            if typ in ANTI_META_TYPES:
                content = str(row.get("content") or "").strip()
                if not content and typ in ("CONVERSATION_HISTORY", "GENERIC"):
                    # empty history rows — skip
                    if typ == "CONVERSATION_HISTORY":
                        continue
                    # empty GENERIC skip
                    if not content:
                        continue
                kind = "system" if typ in ("SYSTEM_MESSAGE",) else "meta"
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        kind,
                        title=typ,
                        text=truncate(content or typ, MAX_SYSTEM if kind == "system" else 1500),
                        collapsed=True,
                    )
                )
                seq += 1
                continue

            # Unknown type — try to keep something useful
            content = row.get("content")
            tool_calls = row.get("tool_calls")
            if tool_calls:
                tools = []
                for tc in tool_calls if isinstance(tool_calls, list) else []:
                    if isinstance(tc, dict):
                        tools.append(
                            tool_entry(
                                tc.get("name") or typ,
                                input_val=tc.get("args") or tc.get("arguments"),
                            )
                        )
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        "tool_call",
                        title=typ,
                        text=str(content or "")[:500],
                        tools=tools,
                        collapsed=True,
                    )
                )
                seq += 1
            elif content:
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        "other",
                        title=typ,
                        text=str(content),
                        collapsed=True,
                    )
                )
                seq += 1
            # else skip empty

    if messages:
        session["endTs"] = max(session["endTs"], messages[-1]["ts"])
    else:
        session["endTs"] = max(session["endTs"], path.stat().st_mtime)
    return messages


# ─────────────────────────── Pi agent ───────────────────────────


def _pi_blocks_text(content: Any) -> tuple[str, str, list[dict[str, Any]]]:
    """Return (text, thinking, tools) from Pi message content blocks."""
    texts: list[str] = []
    thinking_parts: list[str] = []
    tools: list[dict[str, Any]] = []
    if isinstance(content, str):
        return content, "", []
    if not isinstance(content, list):
        return str(content or ""), "", []
    for block in content:
        if not isinstance(block, dict):
            texts.append(str(block))
            continue
        btype = block.get("type") or ""
        if btype == "text":
            texts.append(str(block.get("text") or ""))
        elif btype == "thinking":
            thinking_parts.append(str(block.get("thinking") or block.get("text") or ""))
        elif btype in ("toolCall", "tool_use", "tool_call"):
            name = block.get("name") or "tool"
            args = block.get("arguments") or block.get("input") or block.get("args")
            tools.append(tool_entry(name, input_val=args))
        else:
            # fallback
            if block.get("text"):
                texts.append(str(block["text"]))
    return "\n".join(t for t in texts if t).strip(), "\n".join(thinking_parts).strip(), tools


def parse_pi(path: Path, session: dict[str, Any]) -> list[dict[str, Any]]:
    """Parse Pi agent session JSONL (type=message with nested message.role)."""
    agent = "pi"
    sid = session["id"]
    lane = session["lane"]
    messages: list[dict[str, Any]] = []
    seq = 0
    last_ts = session["startTs"]

    with path.open(encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as e:
                log_issue(f"{path.name}:{line_no}: JSON error: {e}")
                continue

            typ = row.get("type") or ""
            # session/model meta — skip or collapse
            if typ in ("session", "model_change", "thinking_level_change"):
                continue
            if typ != "message":
                continue

            msg = row.get("message") or {}
            if not isinstance(msg, dict):
                continue
            role = (msg.get("role") or "").strip()
            ts = parse_iso_to_epoch(row.get("timestamp") or msg.get("timestamp"))
            if ts is None:
                ts = last_ts + 0.001
            if ts <= last_ts:
                ts = last_ts + 0.001
            last_ts = ts

            content = msg.get("content")
            text, thinking, tools = _pi_blocks_text(content)

            if role == "user":
                if not text.strip():
                    continue
                messages.append(
                    make_msg(sid, agent, lane, seq, ts, "user", text=text, collapsed=False)
                )
                seq += 1
                continue

            if role == "assistant":
                if tools and not text and not thinking:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "tool_call",
                            title=", ".join(t["name"] for t in tools[:4]),
                            tools=tools,
                            collapsed=True,
                        )
                    )
                elif thinking and not text and not tools:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "thinking",
                            thinking=thinking,
                            collapsed=True,
                        )
                    )
                else:
                    messages.append(
                        make_msg(
                            sid,
                            agent,
                            lane,
                            seq,
                            ts,
                            "assistant",
                            text=text,
                            thinking=thinking or None,
                            tools=tools or None,
                            collapsed=False,
                        )
                    )
                seq += 1
                continue

            if role in ("toolResult", "tool_result", "tool"):
                name = msg.get("toolName") or "toolResult"
                out = text
                if not out and isinstance(content, list):
                    out = json.dumps(content, ensure_ascii=False)[:MAX_TOOL_IO]
                te = tool_entry(name, input_val=msg.get("toolCallId"), output_val=out)
                messages.append(
                    make_msg(
                        sid,
                        agent,
                        lane,
                        seq,
                        ts,
                        "tool_result",
                        title=name,
                        text=truncate(out, MAX_TEXT),
                        tools=[te],
                        collapsed=True,
                    )
                )
                seq += 1
                continue

    if messages:
        session["endTs"] = max(session["endTs"], messages[-1]["ts"])
    else:
        session["endTs"] = max(session["endTs"], path.stat().st_mtime)
    return messages


# ─────────────────────────── main pipeline ───────────────────────────


def shrink_if_needed(data: dict[str, Any]) -> dict[str, Any]:
    """Aggressively shrink tool_result text if over target size."""
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    size = len(raw.encode("utf-8"))
    if size <= TARGET_CAP_BYTES:
        return data

    log_issue(f"timeline-data.json raw size {size} exceeds target {TARGET_CAP_BYTES}; shrinking tool_results")

    for msg in data["messages"]:
        if msg.get("kind") in ("tool_result", "tool_call", "meta", "system", "thinking"):
            if msg.get("text") and len(msg["text"]) > 400:
                msg["text"] = truncate(msg["text"], 400)
            if msg.get("thinking") and len(msg["thinking"]) > 800:
                msg["thinking"] = truncate(msg["thinking"], 800)
            for t in msg.get("tools") or []:
                if t.get("input") and len(t["input"]) > 800:
                    t["input"] = truncate(t["input"], 800)
                if t.get("output") and len(t["output"]) > 800:
                    # first/last 15 lines
                    lines = t["output"].splitlines()
                    if len(lines) > 30:
                        t["output"] = (
                            "\n".join(lines[:15])
                            + f"\n…[{len(lines)-30} lines omitted]…\n"
                            + "\n".join(lines[-15:])
                        )
                    t["output"] = truncate(t["output"], 800)
                if t.get("diff") and len(t["diff"]) > 800:
                    t["diff"] = truncate(t["diff"], 800)

    raw2 = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    size2 = len(raw2.encode("utf-8"))
    if size2 > HARD_CAP_BYTES:
        log_issue(f"still over hard cap ({size2}); dropping tool outputs for tool_result only")
        for msg in data["messages"]:
            if msg.get("kind") == "tool_result":
                msg["text"] = truncate(msg.get("text") or "", 200)
                for t in msg.get("tools") or []:
                    t["output"] = truncate(t.get("output") or "", 200)
                    t["diff"] = None
                    t["isDiff"] = False
    return data


def write_report(
    sessions: list[dict[str, Any]],
    messages: list[dict[str, Any]],
    out_size: int,
    lane_count: int,
) -> None:
    by_agent = Counter(m["agent"] for m in messages)
    by_kind = Counter(m["kind"] for m in messages)
    sess_by_agent = Counter(s["agent"] for s in sessions)
    per_session = Counter(m["sessionId"] for m in messages)

    lines = [
        "# Chatlog parse report",
        "",
        f"Generated: {datetime.now(tz=LOCAL_TZ).isoformat(timespec='seconds')}",
        f"Source: `{CHATLOGS}` (files from INDEX.md)",
        f"Output: `{OUT_JSON.name}` ({out_size:,} bytes / {out_size/1024/1024:.2f} MB)",
        "",
        "## Totals",
        "",
        f"- Sessions: **{len(sessions)}**",
        f"- Messages: **{len(messages)}**",
        f"- laneCount: **{lane_count}**",
        "",
        "### Sessions by agent",
        "",
    ]
    for a, n in sorted(sess_by_agent.items()):
        lines.append(f"- {a}: {n}")
    lines += ["", "### Messages by agent", ""]
    for a, n in sorted(by_agent.items()):
        lines.append(f"- {a}: {n}")
    lines += ["", "### Messages by kind", ""]
    for k, n in sorted(by_kind.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"- {k}: {n}")

    lines += ["", "### Messages per session", ""]
    lines.append("| Session | Agent | Messages | startTs | endTs | lane |")
    lines.append("|---|---|---:|---:|---:|---:|")
    for s in sessions:
        lines.append(
            f"| {s['id']} | {s['agent']} | {per_session.get(s['id'], 0)} | "
            f"{s['startTs']:.3f} | {s['endTs']:.3f} | {s['lane']} |"
        )

    lines += ["", "## Validation", ""]
    session_ids = {s["id"] for s in sessions}
    orphan = [m["id"] for m in messages if m["sessionId"] not in session_ids]
    sorted_ok = all(messages[i]["ts"] <= messages[i + 1]["ts"] for i in range(len(messages) - 1)) if len(messages) > 1 else True
    # strict increase within session
    strict_ok = True
    by_sess: dict[str, list[float]] = defaultdict(list)
    for m in messages:
        by_sess[m["sessionId"]].append(m["ts"])
    for sid, tss in by_sess.items():
        for i in range(1, len(tss)):
            if tss[i] <= tss[i - 1]:
                strict_ok = False
                log_issue(f"non-increasing ts in session {sid} at index {i}")
                break

    # lane overlap check
    lane_ok = True
    by_lane: dict[int, list[tuple[float, float, str]]] = defaultdict(list)
    for s in sessions:
        by_lane[s["lane"]].append((s["startTs"], s["endTs"], s["id"]))
    for lane, intervals in by_lane.items():
        intervals.sort()
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i - 1][1]:
                lane_ok = False
                log_issue(
                    f"lane {lane} overlap: {intervals[i-1][2]} ends {intervals[i-1][1]} "
                    f"> {intervals[i][2]} starts {intervals[i][0]}"
                )

    lines.append(f"- orphan messages: {len(orphan)}")
    lines.append(f"- messages sorted by ts: {sorted_ok}")
    lines.append(f"- strictly increasing within session: {strict_ok}")
    lines.append(f"- non-overlapping lanes: {lane_ok}")
    lines.append(f"- laneCount == max(lane)+1: {lane_count == (max((s['lane'] for s in sessions), default=-1) + 1)}")

    lines += ["", "## Parse issues", ""]
    if ISSUES:
        for issue in ISSUES:
            lines.append(f"- {issue}")
    else:
        lines.append("- (none)")

    lines += ["", "## Notes", ""]
    lines.append("- Grok messages lack native timestamps; times are distributed between INDEX start and file mtime.")
    lines.append("- Claude uses message `timestamp` ISO fields (UTC → local label America/New_York).")
    lines.append("- Antigravity uses `created_at`.")
    lines.append("- Large tool outputs truncated; base64 blobs stripped.")
    lines.append("")

    OUT_REPORT.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    if not INDEX_PATH.exists():
        print(f"Missing INDEX: {INDEX_PATH}", file=sys.stderr)
        return 1

    sessions = parse_index(INDEX_PATH)
    if not sessions:
        print("No sessions in INDEX", file=sys.stderr)
        return 1

    # First pass: parse messages with provisional endTs from mtime for grok,
    # actual message times for others. Then re-assign lanes after endTs known.
    all_messages: list[dict[str, Any]] = []
    parsers = {
        "grok": parse_grok,
        "claude": parse_claude,
        "antigravity": parse_antigravity,
        "pi": parse_pi,
    }

    # Temporary lane 0 during parse; lanes assigned after endTs known
    for session in sessions:
        fpath = CHATLOGS / session["file"]
        if not fpath.exists():
            log_issue(f"missing file {session['file']}")
            session["endTs"] = session["startTs"]
            continue
        agent = session["agent"]
        parser = parsers.get(agent)
        if not parser:
            log_issue(f"unknown agent {agent} for {session['id']}")
            continue
        try:
            msgs = parser(fpath, session)
            all_messages.extend(msgs)
        except Exception as e:
            log_issue(f"parse failed {session['id']}: {e!r}")
            session["endTs"] = max(session["endTs"], fpath.stat().st_mtime)

    # Assign lanes with final [startTs, endTs]
    lane_count = assign_lanes(sessions)
    # Update message lanes to match session lanes
    lane_by_sid = {s["id"]: s["lane"] for s in sessions}
    for m in all_messages:
        m["lane"] = lane_by_sid.get(m["sessionId"], m["lane"])

    # Global sort by ts, then session id, then id for stability
    all_messages.sort(key=lambda m: (m["ts"], m["sessionId"], m["id"]))

    # Drop internal keys from sessions
    public_sessions = []
    for s in sessions:
        public_sessions.append(
            {
                "id": s["id"],
                "file": s["file"],
                "agent": s["agent"],
                "label": s["label"],
                "startTs": float(s["startTs"]),
                "endTs": float(s["endTs"]),
                "lane": int(s["lane"]),
                "color": s["color"],
            }
        )

    data: dict[str, Any] = {
        "generatedAt": datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z"),
        "sessions": public_sessions,
        "messages": all_messages,
        "laneCount": lane_count,
    }

    data = shrink_if_needed(data)

    # Final write (pretty enough for debugging but compact)
    OUT_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    out_size = OUT_JSON.stat().st_size

    # If pretty JSON too big, rewrite compact
    if out_size > HARD_CAP_BYTES:
        log_issue(f"pretty JSON {out_size} over hard cap; rewriting compact")
        OUT_JSON.write_text(
            json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        out_size = OUT_JSON.stat().st_size

    write_report(public_sessions, all_messages, out_size, lane_count)

    print(f"Wrote {OUT_JSON} ({out_size:,} bytes)")
    print(f"Wrote {OUT_REPORT}")
    print(f"sessions={len(public_sessions)} messages={len(all_messages)} laneCount={lane_count}")
    print(f"by agent: {dict(Counter(m['agent'] for m in all_messages))}")
    print(f"by kind: {dict(Counter(m['kind'] for m in all_messages))}")
    if ISSUES:
        print(f"issues ({len(ISSUES)}):")
        for i in ISSUES[:20]:
            print(f"  - {i}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
