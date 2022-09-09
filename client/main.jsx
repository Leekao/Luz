import React from 'react'
import { Meteor } from 'meteor/meteor'
import { render } from 'react-dom'
import { TomorrowEditor } from './editor'

const MainApp = () => {
  return <div>
    <TomorrowEditor />
  </div>
}

Meteor.startup(() => {
  render(<MainApp/>, document.getElementById('react-target'));
});
