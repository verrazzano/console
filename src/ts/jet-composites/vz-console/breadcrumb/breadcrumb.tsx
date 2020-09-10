// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { VComponent, customElement, h, listener } from "ojs/ojvcomponent";
import { stringToNodeArray } from "@oracle/oraclejet/dist/types/ojhtmlutils";

class Props {
  items: [{label: string, href?: string}];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-breadcrumb")
export class ConsoleBreadcrumb extends VComponent<Props> {

  @listener({ capture: true, passive: true })
  protected openLink(event: CustomEvent) {
    window.open((event.target as Element).getAttribute("href"),"_self")
  }

  protected render() {
    const breadcrumbItems: Element[] = [];
    this.props.items.forEach(({label, href}) => {
      if (href) {
        breadcrumbItems.push(<li><a class onClick={this.openLink} href={href}>{label}</a></li>)
      } else {
        breadcrumbItems.push(<li class="breadcrumb-label">{label}</li>)
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
