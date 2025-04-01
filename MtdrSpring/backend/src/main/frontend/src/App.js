/*
## MyToDoReact version 1.0.
##
## Copyright (c) 2022 Oracle, Inc.
## Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl/
*/
/*
 * This is the application main React component. We're using "function"
 * components in this application. No "class" components should be used for
 * consistency.
 * @author  jean.de.lavarene@oracle.com
 */
import React from "react";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Dashboard>
      <div className="App">
        <h1>MY TODO LIST</h1>
      </div>
    </Dashboard>
  );
}

export default App;
