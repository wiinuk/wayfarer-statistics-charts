type KnownElementTagNameMap = HTMLElementTagNameMap & SVGElementTagNameMap;

type KnownAttributeNameAndType<
    TTagName extends keyof KnownElementTagNameMap,
    TPropertyName extends keyof KnownElementTagNameMap[TTagName]
> = TPropertyName extends "classList"
    ? { name: "class"; type: string }
    : TPropertyName extends "htmlFor"
    ? { name: "for"; type: string }
    : KnownElementTagNameMap[TTagName][TPropertyName] extends
          | string
          | boolean
          | number
    ? {
          name: TPropertyName;
          type: KnownElementTagNameMap[TTagName][TPropertyName];
      }
    : KnownElementTagNameMap[TTagName][TPropertyName] extends SVGAnimatedLength
    ? {
          name: TPropertyName;
          type: number | string;
      }
    : KnownElementTagNameMap[TTagName][TPropertyName] extends SVGAnimatedEnumeration
    ? {
          name: TPropertyName;
          type: string;
      }
    : TPropertyName extends "style"
    ? {
          name: TPropertyName;
          type: string | ((style: CSSStyleDeclaration) => void);
      }
    : [TTagName, TPropertyName] extends ["marker", "orientAngle"]
    ? {
          name: "orient";
          type: string;
      }
    : { name: never; type: never };

type KnownExtendedAttributes<TTagName extends keyof KnownElementTagNameMap> =
    TTagName extends "path"
        ? {
              d: string;
              fill: string;
              stroke: string;
          }
        : // eslint-disable-next-line @typescript-eslint/ban-types
          {};

type ElementProperties<TName extends keyof KnownElementTagNameMap> = {
    [k in keyof KnownElementTagNameMap[TName] as KnownAttributeNameAndType<
        TName,
        k
    >["name"]]?: KnownAttributeNameAndType<TName, k>["type"];
} & KnownExtendedAttributes<TName> & { readonly classList?: readonly string[] };

type falsy = false | null | undefined | 0 | "" | void;
interface JsxOption {
    key?: string | number;
}
type Children = readonly (HTMLElement | string | falsy)[];
type ChildrenProperty =
    | readonly (HTMLElement | string | falsy)[]
    | HTMLElement
    | string
    | falsy;

export function jsxs<TName extends keyof KnownElementTagNameMap>(
    name: TName,
    properties: Readonly<
        ElementProperties<TName> & {
            children?: ChildrenProperty;
        }
    > | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _option?: JsxOption
): KnownElementTagNameMap[TName] {
    const element = document.createElement(name);
    for (const [key, value] of Object.entries(properties ?? {})) {
        if (key === "children") continue;
        if (key === "style" && typeof value === "function") {
            value(element.style);
            continue;
        }
        if (key === "classList") {
            if (typeof value === "string") {
                element.classList.add(name);
            } else {
                for (const name of value as readonly string[]) {
                    element.classList.add(name);
                }
            }
        }
        element.setAttribute(key, String(value));
    }
    const children = properties?.children;
    if (children) {
        if (Array.isArray(children)) {
            for (const child of children.flat() as Children) {
                if (!child) continue;
                element.append(child);
            }
        } else {
            element.append(children as HTMLElement | string);
        }
    }
    return element as KnownElementTagNameMap[TName];
}
export const jsx = jsxs;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
    export type Element = HTMLElement;
    export type IntrinsicElements = {
        [tagName in keyof KnownElementTagNameMap]: ElementProperties<tagName>;
    };
}
