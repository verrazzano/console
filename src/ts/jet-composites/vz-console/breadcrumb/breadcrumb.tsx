// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import {
  ElementVComponent,
  customElement,
  listener,
  h,
} from "ojs/ojvcomponent-element";

export type BreadcrumbType = {
  label: string;
  href?: string;
  onclick?: (event: CustomEvent) => void;
};

class Props {
  items: BreadcrumbType[];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-breadcrumb")
export class ConsoleBreadcrumb extends ElementVComponent<Props> {
  @listener({ capture: true, passive: true })
  protected openLink(event: CustomEvent) {
    window.open((event.target as Element).getAttribute("href"), "_self");
  }

  protected render() {
    const breadcrumbItems: Element[] = [];
    this.props.items.forEach((breadcrumb: BreadcrumbType) => {
      if (breadcrumb.href) {
        breadcrumbItems.push(
          <li>
            <a
              class
              onClick={breadcrumb.onclick ? breadcrumb.onclick : this.openLink}
              href={breadcrumb.href}
            >
              {breadcrumb.label}
            </a>
          </li>
        );
      } else {
        breadcrumbItems.push(
          <li class="breadcrumb-label">{breadcrumb.label}</li>
        );
      }
    });

    return (
      <div class="margin-breadcrumb">
        <ul role="navigation" class="breadcrumb">
          {breadcrumbItems}
        </ul>
      </div>
    );
  }
}
