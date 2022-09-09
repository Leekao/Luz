import React, { useEffect, useState } from 'react'
import { useMongoFetch } from 'react-meteor-hooks'
import { getDay, getBacklog, RecTasks } from '../imports/api/tasks'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

let emptyCounter = 0

const RecurringTasks = ({days}) => {
  const query = (days === 7) ? {weekly: true} : {daily: true}
  const backlogTasks = useMongoFetch(RecTasks.find(query))
  const [newTask, setNewTask] = useState('')
  const saveNewTask = (e) => {
    e.preventDefault()
    Meteor.call('new rec task', {days, newTask})
    setNewTask('')
  }
  console.log({backlogTasks})
  return <div>
    <div>{`${days===7 ? 'Weekly' : 'Daily'}`}</div>
    <div>
      <form onSubmit={saveNewTask}>
        <input 
          type="text" 
          style={{
            border: "solid thin black",
            margin: "5px"
          }}
          value={newTask} 
          onChange={e => setNewTask(e.currentTarget.value)} 
        />
        <input 
        style={{
          border: "solid thin black",
          padding: 2,
        }} 
        type="button"
        value="V"
        onClick={saveNewTask}
        />
      </form>
    </div>
  <div>
    {backlogTasks && (
      backlogTasks.map(({_id, task}) => 
        <div style={{
          border: 'solid thin black',
          margin: 1,
          maxWidth: 210,
          fontSize: 14,
          textAlign: 'center',
        }}
          key={_id}
          className={`flex`}>
              <div u
              style={{flexGrow:1}}
              onClick={e => Meteor.call('delete rec task', _id)}
              >X</div>
              <div
              style={{flexGrow:2}}
              >{task}</div>
          </div>
      )
    )}
    </div>
  </div>
}

const DraggableList = ({uniqueId, items}) => {
  if (items.length == 0 || items[0]==undefined) return <div></div>
  console.log({items})
  return (
      <Droppable droppableId={uniqueId}>
        {(provided) => (
          <div
            className={`${uniqueId} flex-1`}
            style={{
              width: '20vw',
              minWidth: 200
            }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => (
              <Draggable key={item._id} draggableId={item._id} index={index}>
                {(provided) => {
                  const {_id, hour, task, done} = item
                  const visibility = (task.startsWith('__Empty'))
                  ? 'hidden'
                  : 'visible'
                  let color = (!done) ? 'black' : 'green'
                  let blink = ''
                  if (color == 'black') {
                    const dateCheck = new Date()
                    dateCheck.setHours(hour,0)
                    if (new Date() > dateCheck) {
                      color = 'red'
                      dateCheck.setHours(hour,59)
                      if (new Date() < dateCheck) {
                        blink = 'blink_me'
                      }
                    }
                  }

                  return <div
                    style={{
                      border: 'solid thin black',
                      margin: 1,
                    }}
                    className="item-container"
                    ref={provided.innerRef}
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                  >
                  <div style={{
                    visibility,
                    border: 'solid thin black',
                    margin: 1,
                    maxWidth: 210,
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                    className={`flex`}>
                       <div 
                        style={{flexGrow:1}}
                        onClick={e => Meteor.call('delete', _id)}
                        >X</div>
                       <div
                        className={`${blink}`}
                        style={{flexGrow:2, color}}
                        >{task}</div>
                       <div
                        onClick={e => Meteor.call('done', _id, !done)}
                        style={{flexGrow:1}}
                        >V</div>
                    </div>
                  </div>
                }
                }
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

  )
}

const DayView = ({date, lists}) => {
  const day = {
    tasks: []
  }
  const [itemList, setItemList] = useState(day.tasks);
  const uniqueId = `${date.getDate()}_${date.getMonth()+1}_${date.getFullYear()}`
  lists[uniqueId] = [itemList, setItemList]
  const tasks = useMongoFetch(getDay(date))
  useEffect(() => {
    console.log('empty tasks created')
    day.tasks = []
    for (let i=emptyCounter; i <= emptyCounter+24; i++) {
      day.tasks.push({
        task: `__Empty${i}`,
        _id: `__Empty${i}`,
      })
    }
    console.log({tasks})
    tasks.forEach(t => {
      console.log({t})
      day.tasks[t.hour] = t
    })
    setItemList(day.tasks)
  }, [tasks])
  
  return (
    <div
      style={{
        border: 'solid thin black'
      }}
    >
      <div style={{
        textAlign: 'center',
        fontWeight: 'bold',
      }}>
        {date.getDate()} / {date.getMonth()+1} / {date.getFullYear()}
      </div>
      <div 
        style={{
          position: 'absolute',
          top: 57+(37*(new Date().getHours())),
        }}
      >____________________________________</div>
      <div 
        className='flex'>
        <div 
          style={{
            textAlign: 'center',
            padding: '1px 7.5px',
          }}
          className='flex-initial'>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
          <div>6</div>
          <div>7</div>
          <div>8</div>
          <div>9</div>
          <div>10</div>
          <div>11</div>
          <div>12</div>
          <div>13</div>
          <div>14</div>
          <div>15</div>
          <div>16</div>
          <div>17</div>
          <div>18</div>
          <div>19</div>
          <div>20</div>
          <div>21</div>
          <div>22</div>
          <div>23</div>
        </div>
      <DraggableList uniqueId={uniqueId} items={itemList} setItems={setItemList} />
      </div>
    </div>
  )
}

export const TomorrowEditor = () => {
  const [newTask, setNewTask] = useState('')
  const [backlog, setBacklog] = useState([]);
  const backlogTasks = useMongoFetch(getBacklog())
  useEffect(() => {
    if (backlogTasks.length > 0) setBacklog(backlogTasks.map(t => t))
  }, [backlogTasks])

  const lists = {
    'backlog': [backlog, setBacklog]
  }
  const handleDrop = (droppedItem) => {
    if (!droppedItem.destination) {
      droppedItem.destination = { "droppableId": "backlog", "index": 0 }
    }
    const source = lists[droppedItem.source.droppableId]
    const target = lists[droppedItem.destination.droppableId]
    const updatedSource = [...source[0]]
    const [reorderedItem] = updatedSource.splice(droppedItem.source.index, 1)
    if (droppedItem.destination?.droppableId == droppedItem.source?.droppableId) {
      updatedSource.splice(droppedItem.destination.index, 0, reorderedItem)
      source[1](updatedSource)
      lists[droppedItem.source.droppableId] = [updatedSource, source[1]]
    } else {
      source[1](updatedSource)
      lists[droppedItem.source.droppableId] = [updatedSource, source[1]]
      const updatedTarget = [...target[0]]
      updatedTarget.splice(droppedItem.destination.index, 0, reorderedItem)
      target[1](updatedTarget)
      lists[droppedItem.destination.droppableId] = [updatedTarget, target[1]]
    }
    const {backlog, ...days} = lists
    const savedLists = {backlog: backlog[0]}
    for (date of Object.keys(days)) {
      savedLists[date] = days[date][0]
    }
    console.log(savedLists)
    Meteor.call('save', savedLists)
    return
  }
  const dateCheck = new Date()
  dateCheck.setHours(20,50)
  let tomorrow = false
  const pastEleven = new Date() > dateCheck
  if (pastEleven) {
    tomorrow = new Date()
    tomorrow.setDate(new Date().getDate()+1)
  }
  const saveNewTask = (e) => {
    e.preventDefault()
    Meteor.call('new task', newTask)
    setNewTask('')
  }
  return <div>
    <div>
      <form onSubmit={saveNewTask}>
        <input 
          type="text" 
          style={{
            border: "solid thin black",
            margin: "5px"
          }}
          value={newTask} 
          onChange={e => setNewTask(e.currentTarget.value)} 
        />
        <input 
        style={{
          border: "solid thin black",
          padding: 2,
        }} 
        type="button"
        value="V"
        onClick={saveNewTask}
        />
      </form>
    </div>
    <div className='flex'>
      <DragDropContext className='flex-initial' onDragEnd={handleDrop}>
        <div
          style={{
            border: "solid thin black",
            margin: "5px"
          }}
          className="backlog flex-initial">
            <div>Back Log</div>
            <DraggableList lists={lists} uniqueId={'backlog'} items={backlog} setItems={setBacklog} />
        </div>
        <div style={{
            margin: "5px"
          }}>
            <DayView lists={lists} date={new Date()} />
        </div>
        {pastEleven && (
          <div style={{
              margin: "5px"
            }}>
              <DayView lists={lists} date={tomorrow} />
          </div>
        )}
      <div>
        <RecurringTasks days={1} />
        <RecurringTasks days={7} />
      </div>
      </DragDropContext>
    </div>
  </div>
}