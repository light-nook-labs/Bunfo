import json
import time
from urllib.parse import urlencode, urljoin

from scrapy import Spider, Request
from scrapy.exceptions import CloseSpider


class InfoSpider(Spider):
    name = "info"
    _page_num = 1
    _params = {
        "op": "getLatestNovels",
        "pi": 0,
        "nt": 0,
        "s": 0,
        "p": 0,
        "c": 0,
        "_": 0,
    }
    _base_url = "https://www.lolobun.com/ajax/common.ashx"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.output_file = "data/novels.jsonl"

    async def start(self):
        urls = [self._join_url()]
        for url in urls:
            yield Request(url, callback=self.parse)

    def _join_url(self):
        self._params["pi"] = self._page_num
        self._params["_"] = int(time.time() * 1000)
        params = urlencode(self._params)
        self._page_num += 1
        return urljoin(self._base_url, f"?{params}")

    def parse(self, response):
        info_list: list = response.json().get("data", [])
        if not info_list:
            raise CloseSpider("No more data")
        for info in info_list:
            yield info
        yield response.follow(self._join_url(), callback=self.parse)
