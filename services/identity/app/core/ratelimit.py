import threading
import time


class FixedWindowLimiter:
    """A tiny in-process fixed-window rate limiter.

    Single-process and in-memory — perfect for a self-contained demo and the
    subject's "rate limiting" requirement (hit the cap → 429). If the service
    is ever scaled horizontally, swap this for a Redis-backed counter; the
    dependency interface (`check`) stays the same.
    """

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        # key -> (count, window_start_epoch)
        self._hits: dict[str, tuple[int, float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str) -> tuple[bool, int, int]:
        """Register one hit for `key`.

        Returns (allowed, remaining, retry_after_seconds).
        """
        now = time.time()
        with self._lock:
            count, start = self._hits.get(key, (0, now))
            if now - start >= self.window:
                count, start = 0, now
            count += 1
            self._hits[key] = (count, start)
        allowed = count <= self.limit
        remaining = max(0, self.limit - count)
        retry_after = max(0, int(self.window - (now - start)))
        return allowed, remaining, retry_after
