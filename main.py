import time
from urllib.parse import urlencode, urljoin


def main():
    print("Hello from bunfo!")


params = {
    "op": "getLatestNovels",
    "pi": 1,
    "nt": 0,
    "s": 0,
    "p": 0,
    "c": 0,
    "_": int(time.time() * 1000),
}
if __name__ == "__main__":
    # main()
    url = urljoin('example.com', f"?{urlencode(params)}")
    print(url)
    print(time.time())
    print(time.time() * 1000)
    print(1779177306527)
