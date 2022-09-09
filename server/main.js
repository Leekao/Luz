import { Meteor } from 'meteor/meteor';
import { Tasks, RecTasks } from '../imports/api/tasks'

Meteor.startup(() => {
  let task = Tasks.findOne()
  console.log('checking tasks')
  if (!task) {
    console.log('creating new task')
    const todate = new Date()
    Tasks.insert({
      backlog: true,
      task: 'Get Haircut',
    })
    Tasks.insert({
      date: todate.getDate(),
      month: todate.getMonth()+1,
      year: todate.getFullYear(),
      backlog: false,
      task: 'Get Shoes',
      done: false,
      hour: 9
    })
  } else {
    console.log('printing')
    console.log('tasks', Tasks.find().fetch().length)
    console.log('rec tasks', RecTasks.find().fetch().length)
  }
  const moveTasks = (todate = new Date()) => {
      console.log(todate.getMonth(), todate.getDate(), todate.getFullYear())
      return Tasks.update({
        date: todate.getDate(),
        month: todate.getMonth(),
        year: todate.getFullYear(),
        backlog: false,
        $or: [
          {done: {
            $exists: false
          }},
          {done: false}
        ]
      }, {
        $set: {
          backlog: true,
          date: false,
          month: false,
          year: false,
        }
      }, {
        multi: true
      })
  }

  SyncedCron.add({
    name: 'Move tasks to backlog',
    schedule: function(parser) {
      return parser.text('at 23:58 pm')
    },
    job: function() {
      const todate = new Date()
      todate.setMonth(todate.getMonth()+1)
      const affected = moveTasks(todate)
      console.log(affected, 'rows affected')
    }
  })
  SyncedCron.add({
    name: 'Create tasks on day start',
    schedule: function(parser) {
      return parser.text('at 11:00 pm')
    },
    job: function() {
      console.log('adding daily tasks')
      RecTasks.find({
        daily: true
      }).fetch().forEach(t => {
        Tasks.upsert({
          task: t.task,
          backlog: true,
          done: true
        }, {
          $set: {
            task: t.task,
            backlog: true,
            done: false
          }
        })
      })
    }
  })
  SyncedCron.add({
    name: 'Create tasks on week start',
    schedule: function(parser) {
      return parser.text('at 11:00 pm on Sat')
    },
    job: function() {
      console.log('adding weekly tasks')
      RecTasks.find({
        weekly: true
      }).fetch().forEach(t => {
        Tasks.upsert({
          task: t.task,
          backlog: true,
          done: true
        }, {
          $set: {
            task: t.task,
            backlog: true,
            done: false
          }
        })
      })
    }
  })
  SyncedCron.start()
})
