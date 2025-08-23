import sys
from pathlib import Path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir / "server" / "app"))
