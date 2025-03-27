# ~~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~~ #
import hashlib
import json


def dict_hash(dictionary: dict) -> str:
    dhash = hashlib.sha1()
    encoded = json.dumps(dictionary, sort_keys=True).encode("utf-8")
    dhash.update(encoded)
    return dhash.hexdigest()
