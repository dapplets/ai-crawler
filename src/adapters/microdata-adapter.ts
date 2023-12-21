import { getChildContextElements } from "./bos-adapter";
import { DynamicHtmlAdapter } from "./dynamic-html-adapter";
import { IAdapter } from "./interface";

export class MicrodataAdapter extends DynamicHtmlAdapter implements IAdapter {
  override parseContext(element: Element) {
    const childElements = getChildContextElements(element, "itemprop");
    const result: [string, string | null][] = [];

    for (const childElement of childElements) {
      const propName = childElement.getAttribute("itemprop")!;
      const propValue = MicrodataAdapter.getPropertyValue(childElement) ?? null;
      result.push([propName, propValue]);
    }

    if (element.hasAttribute("itemid")) {
      const id = element.getAttribute("itemid")!;
      result.push(["id", id]);
    }

    return result;
  }

  override findChildElements(element: Element) {
    return getChildContextElements(element, "itemtype").map((element) => ({
      element,
      contextName: element.getAttribute("itemtype")!,
    }));
  }

  static getPropertyValue(element: Element) {
    if (element.hasAttribute("itemscope")) {
      return undefined;
    } else if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content")?.trim();
    } else if (
      ["audio", "embed", "iframe", "img", "source", "track", "video"].includes(
        element.tagName.toLowerCase()
      ) ||
      ["a", "area", "link"].includes(element.tagName.toLowerCase())
    ) {
      return element.getAttribute("src") || element.getAttribute("href") || "";
    } else if (element.tagName.toLowerCase() === "object") {
      return element.getAttribute("data") || "";
    } else if (
      element.tagName.toLowerCase() === "data" ||
      element.tagName.toLowerCase() === "meter"
    ) {
      return element.getAttribute("value") || "";
    } else if (element.tagName.toLowerCase() === "time") {
      return element.getAttribute("datetime") || "";
    } else if (element.hasAttribute("content")) {
      return element.getAttribute("content")?.trim();
    } else {
      return element.textContent?.trim();
    }
  }
}
