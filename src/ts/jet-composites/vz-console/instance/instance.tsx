import { VComponent, customElement, h } from 'ojs/ojvcomponent';
import { VerrazzanoApi }  from 'vz-console/service/loader';
import { Instance } from 'vz-console/service/types'

class Props {
}

class State {
  instance? : Instance
  loading? : boolean = true
}

/**
 * @ojmetadata pack "vz-console"
*/
@customElement('vz-console-instance')
// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

export class ConsoleInstance extends VComponent {
  verrazzanoApi : VerrazzanoApi;
  state: State = {
    loading: true
  }

  constructor() {
    super(new Props())
    this.verrazzanoApi = new VerrazzanoApi();
  }
  protected mounted() {
    this.getData();
    console.log("hello ji");
  }

  async getData() { 
    this.updateState({loading: true})
    this.verrazzanoApi.getInstance("0").then((response) => this.updateState({loading: false, instance: response.data}))
  }

  protected render() {
    console.log("render");
    if (this.state.loading) {
      return <p>Loading..</p>;
    } else {
      return <p>{this.state.instance.elasticUrl}</p>;
    }
    
  }
}