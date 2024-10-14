import hashlib
import inspect
from sqlalchemy.orm.session import Session
from starlette.responses import Response
from starlette.requests import Request


# Custom key builder function that ignores non-serializable parameters
def custom_key_builder(func, *args, **kwargs):
    """
    Builds a cache key using all parameters except non-serializable ones like 'db' and 'response'.
    """

    # Get the function signature
    signature = inspect.signature(func)

    all_args = {
        **dict(zip(signature.parameters, args)),
        **kwargs,
    }
    # Filter out non-serializable parameters
    serializable_args = []
    for arg_name, arg_value in all_args.items():
        if isinstance(arg_value, tuple):
            for i in arg_value:
                if not isinstance(i, (Session, Response, Request)) and not arg_name.startswith("_"):
                    serializable_args.append(f"{arg_name}={i}")
        elif isinstance(arg_value, dict):
            for k, v in arg_value.items():
                if not isinstance(v, (Session, Response, Request)) and not arg_name.startswith("_"):
                    serializable_args.append(f"{arg_name}={v}")
        elif (
            not isinstance(arg_value, (Session, Response, Request))
            and not arg_name.startswith("_")
        ):
            serializable_args.append(f"{arg_name}={arg_value}")
   
    # Generate a unique string based on function name and serializable arguments
    cache_key_str = f"{func.__module__}:{func.__name__}:{serializable_args}"

    # Hash the string to create the cache key
    return hashlib.sha1(cache_key_str.encode()).hexdigest()
