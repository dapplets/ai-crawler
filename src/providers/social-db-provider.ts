import Big from "big.js";

import { NearSigner } from "./near-signer";
import { ParserConfig } from "../core/parsers/json-parser";
import { BosUserLink, IProvider, LinkTemplate } from "./provider";
import { IContextNode } from "../core/tree/types";
import { generateGuid } from "../core/utils";

const JsonParserNamespace = "https://dapplets.org/ns/json/";

const ProjectIdKey = "dapplets.near";
const ParserKey = "parser";
const SettingsKey = "settings";
const LinkKey = "link";
const WidgetKey = "widget";
const SelfKey = "";
const LinkTemplateKey = "linkTemplate";

/**
 * All Mutable Web data is stored in the Social DB contract in `settings` namespace.
 * More info about the schema is here:
 * https://github.com/NearSocial/standards/blob/8713aed325226db5cf97ab9744ba78b561cc377b/types/settings/Settings.md
 *
 * Example of a data stored in the contract is here:
 * /docs/social-db-reference.json
 */
export class SocialDbProvider implements IProvider {
  constructor(private _signer: NearSigner, private _contractName: string) {}

  async getParserConfig(ns: string): Promise<ParserConfig | null> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(ns);

    const authorizedAccountId = await this._signer.getAccountId();

    if (!authorizedAccountId) throw new Error("User is not logged in");
    if (authorizedAccountId !== accountId) throw new Error("No access");

    const queryResult = await this._signer.view(this._contractName, "get", {
      keys: [
        `*/${SettingsKey}/${ProjectIdKey}/${ParserKey}/${parserLocalId}/**`,
      ],
    });

    const parserConfigJson =
      queryResult[accountId]?.[SettingsKey]?.[ProjectIdKey]?.[ParserKey]?.[
        parserLocalId
      ]?.[SelfKey];

    if (!parserConfigJson) return null;

    return JSON.parse(parserConfigJson);
  }

  async createParserConfig(config: ParserConfig): Promise<void> {
    const { accountId, parserLocalId } = this._extractParserIdFromNamespace(
      config.namespace
    );

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: {
                [ParserKey]: {
                  [parserLocalId]: {
                    [SelfKey]: JSON.stringify(config),
                  },
                },
              },
            },
          },
        },
      },
      gas,
      deposit
    );
  }

  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    // JSON-configured parsers require id for the context
    if (
      !context.id &&
      context.namespaceURI!.startsWith("https://dapplets.org/ns/json/")
    ) {
      return [];
    }

    // ToDo: index links by context/widget/contextType/etc.
    // ToDo: fix GasLimitExceeded error using Social DB API
    // ToDo: cache the query
    // Fetch all links from every user
    const resp = await this._signer.view(this._contractName, "get", {
      keys: [`*/${SettingsKey}/${ProjectIdKey}/${LinkKey}/*/${WidgetKey}/*/**`],
    });

    const userLinksOutput: BosUserLink[] = [];

    for (const accountId in resp) {
      const widgetOwners = resp[accountId][SettingsKey][ProjectIdKey][LinkKey];
      for (const widgetOwnerId in widgetOwners) {
        const widgets = widgetOwners[widgetOwnerId][WidgetKey];
        for (const widgetLocalId in widgets) {
          const userLinks = widgets[widgetLocalId];
          for (const linkId in userLinks) {
            const link = userLinks[linkId];

            // Include only suitable links
            if (link.namespace && link.namespace !== context.namespaceURI) continue;
            if (link.contextType && link.contextType !== context.tagName) continue;
            if (link.contextId && link.contextId !== context.id) continue;

            const userLink: BosUserLink = {
              id: linkId,
              namespace: link.namespace,
              contextType: link.contextType,
              contextId: link.contextId,
              insertionPoint: link.insertionPoint,
              bosWidgetId: `${widgetOwnerId}/${WidgetKey}/${widgetLocalId}`,
            };
            userLinksOutput.push(userLink);
          }
        }
      }
    }

    return userLinksOutput;
  }

  async createLink(link: Omit<BosUserLink, "id">): Promise<BosUserLink> {
    const linkId = generateGuid();
    const [widgetOwnerId, , bosWidgetLocalId] = link.bosWidgetId.split("/");

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: {
                [LinkKey]: {
                  [widgetOwnerId]: {
                    [WidgetKey]: {
                      [bosWidgetLocalId]: {
                        [linkId]: {
                          namespace: link.namespace,
                          contextType: link.contextType,
                          contextId: link.contextId ?? null,
                          insertionPoint: link.insertionPoint,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      gas,
      deposit
    );

    return { id: linkId, ...link };
  }

  async deleteUserLink(
    userLink: Pick<BosUserLink, "id" | "bosWidgetId">
  ): Promise<void> {
    const [widgetOwnerId, , bosWidgetLocalId] = userLink.bosWidgetId.split("/");
    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: {
                [LinkKey]: {
                  [widgetOwnerId]: {
                    [WidgetKey]: {
                      [bosWidgetLocalId]: {
                        [userLink.id]: {
                          [SelfKey]: null,
                          namespace: null,
                          contextType: null,
                          contextId: null,
                          insertionPoint: null,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      gas,
      deposit
    );
  }

  async getLinkTemplates(bosWidgetId: string): Promise<LinkTemplate[]> {
    const [ownerId, , bosWidgetLocalId] = bosWidgetId.split("/");
    const resp = await this._signer.view(this._contractName, "get", {
      keys: [
        `${ownerId}/${SettingsKey}/${ProjectIdKey}/${LinkTemplateKey}/${ownerId}/${WidgetKey}/${bosWidgetLocalId}/**`,
      ],
    });

    const linkTemplates =
      resp[ownerId]?.[SettingsKey]?.[ProjectIdKey]?.[LinkTemplateKey]?.[
        ownerId
      ]?.[WidgetKey]?.[bosWidgetLocalId];

    if (!linkTemplates) return [];

    const linksOutput: LinkTemplate[] = [];

    for (const linkTemplateId in linkTemplates) {
      const link = linkTemplates[linkTemplateId];
      const userLink: LinkTemplate = {
        id: linkTemplateId,
        namespace: link.namespace,
        contextType: link.contextType,
        contextId: link.contextId,
        insertionPoint: link.insertionPoint,
        bosWidgetId: `${ownerId}/${WidgetKey}/${bosWidgetLocalId}`,
      };
      linksOutput.push(userLink);
    }

    return linksOutput;
  }

  async createLinkTemplate(
    linkTemplate: Omit<LinkTemplate, "id">
  ): Promise<LinkTemplate> {
    const linkTemplateId = generateGuid();
    const [widgetOwnerId, , bosWidgetLocalId] =
      linkTemplate.bosWidgetId.split("/");

    const accountId = await this._signer.getAccountId();

    if (!accountId) throw new Error("User is not logged in");

    const gas = undefined; // default gas
    const deposit = Big(10).pow(19).mul(2000).toFixed(0); // storage deposit ToDo: calculate it dynamically

    await this._signer.call(
      this._contractName,
      "set",
      {
        data: {
          [accountId]: {
            [SettingsKey]: {
              [ProjectIdKey]: {
                [LinkTemplateKey]: {
                  [widgetOwnerId]: {
                    [WidgetKey]: {
                      [bosWidgetLocalId]: {
                        [linkTemplateId]: {
                          namespace: linkTemplate.namespace,
                          contextType: linkTemplate.contextType,
                          contextId: linkTemplate.contextId,
                          insertionPoint: linkTemplate.insertionPoint,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      gas,
      deposit
    );

    return { id: linkTemplateId, ...linkTemplate };
  }

  private _extractParserIdFromNamespace(namespace: string): {
    accountId: string;
    parserLocalId: string;
  } {
    if (!namespace.startsWith(JsonParserNamespace)) {
      throw new Error("Invalid namespace");
    }

    const parserGlobalId = namespace.replace(JsonParserNamespace, "");

    // Example: example.near/parser/social-network
    const [accountId, entityType, parserLocalId] = parserGlobalId.split("/");

    if (entityType !== "parser" || !accountId || !parserLocalId) {
      throw new Error("Invalid namespace");
    }

    return { accountId, parserLocalId };
  }
}