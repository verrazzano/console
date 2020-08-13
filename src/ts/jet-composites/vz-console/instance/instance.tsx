import { VComponent, customElement, h } from 'ojs/ojvcomponent';
import { VerrazzanoApi }  from 'vz-console/service/loader';

/**
 * @ojmetadata pack "vz-console"
*/
@customElement('vz-console-instance')
export class ConsoleInstance extends VComponent {
  protected mounted() {
    new VerrazzanoApi().listApplications().then((response) => console.log(response.data));
    console.log("hello ji");
  }

  protected render() {
    return <p>Hello, World!</p>;
  }
}