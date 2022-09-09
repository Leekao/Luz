import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor';

export const Tasks = new Mongo.Collection('tasks')
export const RecTasks = new Mongo.Collection('rectasks')

if (Meteor.isServer) {

  Meteor.methods({
    "delete rec task": (_id) => {
      RecTasks.remove({_id})
    },
    "delete": (_id) => {
      Tasks.remove({_id})
    },
    "done": (_id, done) => {
      Tasks.update({_id},{$set: {done}})
    },
    "new rec task": ({days, newTask}) => {
      const query = (days === 7)
        ? {weekly: true}
        : {daily: true}
      RecTasks.insert({
        ...query,
        task: newTask
      })
    },
    "new task": (task) => {
      Tasks.insert({
        task,
        backlog: true
      })
    },
    "save": (lists) => {
      const {backlog, ...days} = lists
      const backlogIds = backlog.map(t => t._id) 
      const affected = Tasks.update({
        _id: {$in: backlogIds}
      }, {
        $set: {
          date: false,
          month: false,
          year: false,
          backlog: true
        }
      }, {
        multi: true
      })
      console.log(`${affected} rows moved to backlog`, backlog)
      console.log({days})
      for (day of Object.keys(days)) {
        const thisDate = day.split('_')
        const selector = {
          date: Number(thisDate[0]),
          month: Number(thisDate[1]),
          year: Number(thisDate[2]),
          backlog: false
        }

        console.log(`Selector created:`,day, selector)

        for (let i=0; i < days[day].length; i++) {
          const {_id, task} = days[day][i]
          console.log({task})
          if (!task.startsWith('__Empty')) {
            Tasks.update({
              _id
            }, {
              $set: {
                ...selector,
                hour: i
              }
            })
            console.log(i, task, _id)
          }
        }
      }
      console.log(Tasks.find().fetch())
    }
  })
}

export const getBacklog = () => {
  return Tasks.find({
    backlog: true
  }, {
    sort: {
      hour: 1
    }
  })
}

export const getDay = (today=new Date()) => {
  return Tasks.find({
    backlog: false,
    date: today.getDate(),
    month: today.getMonth()+1,
    year: today.getFullYear()
  }, {
    sort: {
      hour: 1
    }
  })
}
