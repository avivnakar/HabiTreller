import React, { Component } from 'react'
import { BoardsList } from '../cmps/board/BoardsList.jsx';
import { connect } from 'react-redux';
import { loadBoards } from '../store/actions/boardActions.js';

export class _Boards extends Component {
    componentDidMount() {
        this.loadBoards()
    }

    loadBoards = () => {
        this.props.loadBoards()
    }

    render() {
        return (
            <div className="list-container">
                <BoardsList boards={this.props.boards} />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log(state);

    return {
        // boards: state.Boards.boards,
        boards: [{ _id: '1', name: 'rondelicious', background: '../logo192.png' }],
        // filter: state.Boards.filter
        // loadBoards: function () { console.log('loading boards') }
    }
}
const mapDispatchToProps = {
    loadBoards
}
export const Boards = connect(mapStateToProps, mapDispatchToProps)(_Boards)
