import { Widget } from "near-social-vm";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager } from "styled-components";

export class BosComponent extends HTMLElement {
  private _adapterStylesMountPoint = document.createElement("style");
  private _stylesMountPoint = document.createElement("div");
  private _componentMountPoint = document.createElement("div");
  private _root = createRoot(this._componentMountPoint);

  #src: string = "";
  #props: any = {};

  set src(val: string) {
    this.#src = val;
    this.setAttribute("data-component", val); // For debugging
    this._render();
  }

  get src() {
    return this.#src;
  }

  set props(val: any) {
    this.#props = val;
    this.setAttribute("data-props", JSON.stringify(val)); // For debugging
    this._render();
  }

  get props() {
    return this.#props;
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "closed" });

    // Prevent propagation of clicks from BOS-component to parent
    this._componentMountPoint.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    shadowRoot.appendChild(this._componentMountPoint);
    shadowRoot.appendChild(this._stylesMountPoint);

    // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
    // https://stackoverflow.com/a/68062098
    const disableInheritanceRule = ":host { all: initial; } ";
    this._adapterStylesMountPoint.innerHTML = disableInheritanceRule;
    shadowRoot.appendChild(this._adapterStylesMountPoint);

    // Initial render
    this._render();
  }

  disconnectedCallback() {
    this._root.unmount();
  }

  _render() {
    this._root.render(
      <StyleSheetManager target={this._stylesMountPoint}>
        <Widget src={this.#src} props={this.#props} />
      </StyleSheetManager>
    );
  }
}
