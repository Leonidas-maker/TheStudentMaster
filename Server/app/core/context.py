import contextvars

current_language_var = contextvars.ContextVar("current_language", default="en")