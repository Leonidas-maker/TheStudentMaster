from fastapi import Request, Response
from typing import Optional
import hashlib


def request_key_builder(
    func,
    namespace: str = "",
    *,
    request: Optional[Request] = None,
    response: Optional[Response] = None,
    args,
    kwargs,
):
    relevant_kwargs = {key: value for key, value in kwargs.items() if key not in {"ep_context"}}
    
    if request is None:
        return f"{namespace}:{func.__name__}:{relevant_kwargs}"

    path = request.url.path
    method = request.method
    params = request.query_params

    return f"{namespace}:{hashlib.md5(f'{func.__name__}:{path}:{method}:{params}:{relevant_kwargs}'.encode()).hexdigest()}"
  