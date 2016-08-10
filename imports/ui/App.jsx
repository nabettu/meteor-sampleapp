import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {createContainer} from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

import {Meteor} from 'meteor/meteor';

import {Tasks} from '../api/tasks.js';

import Task from './Task.jsx';

// App component - represents the whole app
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hideCompleted: false
        };
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List</h1>
                    <p>incompleted count: ({this.props.incompleteCount})</p>

                    <label className="hide-completed">
                        <input type="checkbox" readOnly checked={this.state.hideCompleted} onClick={this.toggleHideCompleted.bind(this)}/>
                        Hide Completed Tasks
                    </label>

                    <AccountsUIWrapper/>

                    {this.props.currentUser
                        ? <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                                <input type="text" ref="textInput" placeholder="Type to add new tasks"/>
                            </form>
                        : ''
                    }

                </header>

                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }

    toggleHideCompleted() {
        this.setState({
            hideCompleted: !this.state.hideCompleted
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        // Find the text field via the React ref
        const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Tasks.insert({
            text, createdAt: new Date(), // current time
            owner: Meteor.userId(), // _id of logged in user
            username: Meteor.user().username, // username of logged in user
        });

        // Clear form
        ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }

    renderTasks() {
        let filteredTasks = this.props.tasks;
        if (this.state.hideCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.checked);
        }
        return filteredTasks.map((task) => (<Task key={task._id} task={task}/>));
    }

}

App.propTypes = {
    tasks: PropTypes.array.isRequired,
    incompleteCount: PropTypes.number.isRequired,
    currentUser: PropTypes.object,
};

export default createContainer(() => {
    return {
        tasks: Tasks.find({}, {
            sort: {
                createdAt: -1
            }
        }).fetch(),
        incompleteCount: Tasks.find({
            checked: {
                $ne: true
            }
        }).count(),
        currentUser: Meteor.user()
    };
}, App);
