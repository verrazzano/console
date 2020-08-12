import { VComponent, customElement, h } from 'ojs/ojvcomponent';
import { VerrazzanoApi }  from '..//..//service/VerrazzanoApi';

@customElement('vz-instance')
export class Instance extends VComponent {
  protected mounted() {
    new VerrazzanoApi().listInstances().then((response) => console.log(response.data));
    console.log("hello ji");
  }

  protected render() {
    return <p>Hello, World!</p>;
  }
}