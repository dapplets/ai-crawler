"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockedParserConfigProvider = void 0;
const configs = [
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/near-social-viewer",
        contexts: {
            root: {
                children: ["post"],
            },
            post: {
                selector: '[data-component="mob.near/widget/MainPage.N.Post"] > .post',
                props: {
                    id: "string(concat(substring-before(substring-after(.//*[@data-component=\"mob.near/widget/TimeAgo\"]/../@href, 'accountId='), '&'), '/', substring-after(.//*[@data-component=\"mob.near/widget/TimeAgo\"]/../@href, '&blockHeight=')))",
                    text: 'normalize-space(string(.//*[@data-component="mob.near/widget/MainPage.N.Post.Content"]//*[@data-component="mob.near/widget/N.SocialMarkdown"]))',
                },
                insertionPoints: {
                    like: '[data-component="mob.near/widget/N.LikeButton"]',
                },
            },
        },
    },
    {
        namespace: "https://dapplets.org/ns/json/dapplets.near/parser/twitter",
        contexts: {
            root: {
                props: {
                    id: "string('global')",
                    websiteName: "string('Twitter')",
                    username: "substring-after(string(//header//a[@aria-label='Profile']/@href), '/')",
                    fullname: "string(//*[@aria-label='Account menu']//img/@alt)",
                    img: "string(//*[@aria-label='Account menu']//img/@src)",
                    url: "string(//html/head/meta[@property='og:url']/@content)",
                },
                children: ["post", "profile"],
            },
            post: {
                selector: "div[data-testid=cellInnerDiv]",
                props: {
                    id: "substring-after(string(.//time/../@href), 'status/')",
                    text: "string(.//*[@data-testid='tweetText'])",
                    authorFullname: "string(.//*[@data-testid='User-Name']//span)",
                    authorUsername: "substring-before(substring-after(string(.//time/../@href), '/'), '/')",
                    authorImg: "string(.//img/@src)",
                    createdAt: "string(.//time/@datetime)",
                    url: "concat('https://twitter.com/', substring-before(substring-after(string(.//time/../@href), '/'), '/'), '/status/', substring-after(string(.//time/../@href), 'status/'))",
                },
                insertionPoints: {
                    southPanel: "div[role=group] > *:last-child",
                    avatar: "div.r-18kxxzh.r-1wbh5a2.r-13qz1uu > *:last-child",
                },
            },
            profile: {
                selector: "div[data-testid=primaryColumn]",
                props: {
                    id: "substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@')",
                    authorFullname: "string(.//*[@data-testid='UserName']//span[1])",
                    authorUsername: "substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@')",
                    authorImg: "string(.//img[contains(@alt,'Opens profile photo')]/@src)",
                    url: "concat('https://twitter.com/', substring-after(string(.//*[@data-testid='UserName']/div/div/div[2]//span), '@'))",
                },
                insertionPoints: {
                    southPanel: "div.css-175oi2r.r-obd0qt.r-18u37iz.r-1w6e6rj.r-1h0z5md.r-dnmrzs > a",
                    avatar: "div.r-1ifxtd0.r-ymttw5.r-ttdzmv div.r-ggadg3.r-u8s1d.r-8jfcpp",
                },
            },
        },
    },
];
class MockedParserConfigProvider {
    getParserConfig(namespace) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = configs.find((c) => c.namespace === namespace);
            if (!config)
                return null;
            return config; // ToDo: fix type
        });
    }
}
exports.MockedParserConfigProvider = MockedParserConfigProvider;
