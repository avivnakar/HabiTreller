import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ListPreiview } from '../cmps/board/ListPreiview.jsx';
import { ListMenu } from '../cmps/board/ListMenu.jsx';
import { AddList } from '../cmps/board/AddList.jsx';
import { CardDetails } from '../cmps/card/CardDetails.jsx';
import { setBoard, updateBoard, updateBoardSync, setCard, loadBoards, removeCard } from '../store/actions/boardActions.js';
import { boardService } from '../services/boardService.js';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { BoardHeadNav } from '../cmps/board/BoardHeadNav.jsx';
import { socketService } from '../services/socketService.js';
import { ClickAway } from '../cmps/ClickAway.jsx';


class _BoardDetails extends Component {
    state = {
        currCard: null,
        match: null,
        onClickAway: null
    }
    componentDidMount() {
        this.setState({ match: this.props.match }, this.switchRoute);
        socketService.on('update board', this.props.updateBoardSync)
    }
    componentDidUpdate(prevProps) {
        if (this.state.match !== this.props.match) {
            this.setState({ match: this.props.match }, this.switchRoute)
        }
    }
    onSwitchRoute = () => {

    }
    switchRoute = () => {
        const { boardId, cardId } = this.state.match.params
        var id
        if (boardId) {
            socketService.emit('listen board', boardId);
            id = boardId;
            this.props.setCard(null);
            boardService.getById(id)
                .then(board => this.props.setBoard(board))
        } else {
            id = cardId;
            this.props.loadBoards()
                .then(() => {
                    const { boards } = this.props;
                    const { currBoard, currCard } = boards.reduce((acc, board) => {
                        const tempCard = board.cardLists.reduce((accu, list) => {
                            return accu ? accu : list.cards.find(card => card.id === id);
                        }, null);
                        if (tempCard) acc = { currCard: tempCard, currBoard: board }
                        return acc;
                    }, {});
                    const { setCard, setBoard } = this.props;
                    socketService.emit('listen board', currBoard._id);
                    setBoard(currBoard);
                    setCard(currCard);
                })
        }
    }
    getCurrCard = (card) => {
        this.setState({
            currCard: card
        })
    }
    onDragEnd = result => {
        const { board } = this.props
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        if (type === 'column') {
            console.log(result);
            var list = board.cardLists.find(list => list.id === draggableId)
            board.cardLists.splice(source.index, 1)
            board.cardLists.splice(destination.index, 0, list)
        } else {
            const { destListIdx, srcListIdx, cardMoved } = board.cardLists.reduce((acc, list, idx) => {
                if (source.droppableId === list.id) {
                    acc.srcListIdx = idx
                    acc.cardMoved = list.cards.find(card => card.id === draggableId)
                }
                if (destination.droppableId === list.id) acc.destListIdx = idx
                return acc;
            }, {})
            board.cardLists[srcListIdx].cards.splice(source.index, 1)
            board.cardLists[destListIdx].cards.splice(destination.index, 0, cardMoved)
        }
        this.props.updateBoard(board)
    };
    setOnClickAway = (callback) => {
        this.setState({ onClickAway: callback })
    }
    render() {
        const { setOnClickAway } = this;
        const {onClickAway} = this.state;
        const { board, card, history, updateBoard } = this.props;
        const listProps = { history, updateBoard, board, setOnClickAway }
        if (board) {
            var bg = require('../assets/imgs/' + board.background.toString())
            var styleLi = {
                backgroundImage: `url(${bg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                opacity: 0.9,
                // backgroundColor: 'pink',
                backgroundRepeat: 'no-repeat'
            }
            return (
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId='all' direction="horizontal" type="column">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {/* {onClickAway&&<ClickAway onClick={onClickAway}/>} */}
                                {card && <CardDetails card={this.props.card} board={board}
                                    updateBoard={this.props.updateBoard} history={this.props.history} />}
                                <div className="board-head">
                                    <BoardHeadNav />
                                </div>
                                <div className="board" style={styleLi}>
                                    {/* <ListMenu /> */}
                                    {/* <div className="div">dsfsdfsfsd</div> */}
                                    {board.cardLists && board.cardLists.map((list, index) => <ListPreiview
                                        key={list.id} list={list} getCurrCard={this.getCurrCard} index={index}
                                        {...listProps} />)}
                                    <AddList board={board} updateBoard={this.props.updateBoard} />
                                </div>
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            );
        } else {
            return (<span>no such board</span>);
        }

    }
}
const mapStateToProps = (state) => {
    return {
        board: state.board.currBoard,
        card: state.board.currCard,
        boards: state.board.boards,
        user: state.user.user

    }
}

const mapDispatchToProps = {
    setBoard,
    updateBoard,
    updateBoardSync,
    loadBoards,
    setCard,
    removeCard
}

export const BoardDetails = connect(mapStateToProps, mapDispatchToProps)(_BoardDetails)
