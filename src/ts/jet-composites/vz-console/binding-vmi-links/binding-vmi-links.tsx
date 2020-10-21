// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { VComponent, customElement, h } from "ojs/ojvcomponent";
import { VMI, VMIType } from "vz-console/service/loader";
import "ojs/ojtable";
import { ConsoleMetadataItem } from "vz-console/metadata-item/loader";
import * as Messages from "vz-console/utils/Messages";

class Props {
  vmiInstances?: [VMI];
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-binding-vmi-links")
export class ConsoleBindingVmiLinks extends VComponent<Props> {
  protected render() {
    return (
      <div>
        <ConsoleMetadataItem
          label={Messages.Labels.kibana()}
          value={
            this.props.vmiInstances.find(
              (link: VMI) => link.type === VMIType.Kibana
            ).url
          }
          link={true}
          id={"binding-vmi-link-" + VMIType.Kibana.toLocaleLowerCase()}
        />
        <ConsoleMetadataItem
          label={Messages.Labels.grafana()}
          value={
            this.props.vmiInstances.find(
              (link: VMI) => link.type === VMIType.Grafana
            ).url
          }
          link={true}
          id={"binding-vmi-link-" + VMIType.Grafana.toLocaleLowerCase()}
        />
        <ConsoleMetadataItem
          label={Messages.Labels.prom()}
          value={
            this.props.vmiInstances.find(
              (link: VMI) => link.type === VMIType.Prometheus
            ).url
          }
          link={true}
          id={"binding-vmi-link-" + VMIType.Prometheus.toLocaleLowerCase()}
        />
        <ConsoleMetadataItem
          label={Messages.Labels.es()}
          value={
            this.props.vmiInstances.find(
              (link: VMI) => link.type === VMIType.ElasticSearch
            ).url
          }
          link={true}
          id={"binding-vmi-link-" + VMIType.ElasticSearch.toLocaleLowerCase()}
        />
      </div>
    );
  }
}
