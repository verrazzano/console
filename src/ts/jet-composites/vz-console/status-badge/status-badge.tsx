// Copyright (c) 2020, 2021, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

// eslint-disable-next-line no-unused-vars
import { ElementVComponent, customElement, h } from "ojs/ojvcomponent-element";
import { Status } from "vz-console/service/types";

class Props {
  status: string;
  type: string;
  text: string;
  label: string;
}

/**
 * @ojmetadata pack "vz-console"
 */
@customElement("vz-console-status-badge")
export class ConsoleStatusBadge extends ElementVComponent<Props> {
  protected render() {
    let statusElement: Element;

    switch (this.props.type) {
      case "hexagon": {
        statusElement = (
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            class="badge-hexagon"
          >
            <polygon points="100,50 75,93 25,93 0,50 25,7 75,7"></polygon>
            <text x="50%" y="50%" dy="0.67ex" class="badge-label">
              {this.props.text}
            </text>
          </svg>
        );
        break;
      }

      case "square": {
        statusElement = (
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            class="badge-square"
          >
            <rect width="100" height="100"></rect>
            <text x="50%" y="50%" dy="0.67ex" class="badge-label">
              {this.props.text}
            </text>
          </svg>
        );
        break;
      }

      case "stack": {
        statusElement = (
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 75 100"
            class="badge-stack"
          >
            <path d="M37.2,0C16.6,0,0,8.4,0,18.6v62.8C0,91.6,16.6,100,37.2,100c20.6,0,37.2-8.4,37.2-18.6V18.6C74.4,8.4,57.6,0,37.2,0z"></path>
            <text x="50%" y="50%" dy="0.67ex" class="badge-label">
              {this.props.text}
            </text>
          </svg>
        );
        break;
      }

      case "circle": {
        statusElement = (
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 110"
            class="badge-circle"
          >
            <circle cx="50" cy="60" r="50" />
            <text x="50%" y="55%" dy="0.67ex" class="badge-label">
              {this.props.text}
            </text>
          </svg>
        );
        break;
      }

      default: {
        break;
      }
    }

    let statusClass: string;
    switch (this.props.status) {
      case Status.Running: {
        statusClass = "status-badge-status-good status-badge-container";
        break;
      }

      case Status.Terminated: {
        statusClass = "status-badge-status-error status-badge-container";
        break;
      }

      case Status.Pending: {
        statusClass = "status-badge-status-info status-badge-container";
        break;
      }

      default: {
        break;
      }
    }

    return (
      <div class={statusClass}>
        {statusElement}
        <p class="status-badge-status-label">{this.props.label}</p>
      </div>
    );
  }
}
