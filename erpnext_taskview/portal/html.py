# Copyright (c) 2026, Avunu LLC and contributors
# For license information, please see license.txt

"""HTML going into and out of the customer portal."""

from urllib.parse import urlencode

import nh3
from bs4 import BeautifulSoup
from frappe.utils.html_utils import sanitize_html

# What a customer may write in a task description or comment: the rich-text
# basics frappe-ui's TextEditor produces.  No <span> (so a customer can't forge
# a desk @mention), no images (customers attach files instead), no styles.
_CUSTOMER_TAGS = {
	"p",
	"br",
	"div",
	"h1",
	"h2",
	"h3",
	"h4",
	"strong",
	"b",
	"em",
	"i",
	"u",
	"s",
	"ul",
	"ol",
	"li",
	"blockquote",
	"pre",
	"code",
	"hr",
	"a",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
}

DOWNLOAD_METHOD = "/api/method/erpnext_taskview.portal.api.download_file"

# Private file URLs: local private files and cloud_storage's S3 proxy.
_PRIVATE_PREFIXES = ("/private/files/", "/api/method/retrieve")


def clean_customer_html(html: str | None) -> str:
	"""Sanitize rich text written by a customer."""
	if not html:
		return ""
	return nh3.clean(html, tags=_CUSTOMER_TAGS, clean_content_tags={"script", "style"}).strip()


def is_blank_html(html: str | None) -> bool:
	"""True when the HTML has no visible text (e.g. an empty editor's ``<p></p>``)."""
	if not html:
		return True
	return not BeautifulSoup(html, "html.parser").get_text(strip=True)


def download_url(file_url: str) -> str:
	return f"{DOWNLOAD_METHOD}?{urlencode({'file_url': file_url})}"


def render_staff_html(html: str | None) -> str:
	"""Prepare desk-authored rich text (task descriptions, comments) for the portal.

	Sanitizes it, then points private image / link URLs — which a customer's
	browser can't fetch directly — at the permission-checked download endpoint.
	"""
	if not html:
		return ""
	html = sanitize_html(html, always_sanitize=True)
	soup = BeautifulSoup(html, "html.parser")
	changed = False
	for tag, attr in (("img", "src"), ("a", "href")):
		for el in soup.find_all(tag):
			url = el.get(attr)
			if isinstance(url, str) and url.startswith(_PRIVATE_PREFIXES):
				el[attr] = download_url(url)
				changed = True
	for el in soup.find_all("a"):
		el["target"] = "_blank"
		el["rel"] = "noopener noreferrer"
		changed = True
	return str(soup) if changed else html
