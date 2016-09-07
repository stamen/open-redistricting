import React, { PropTypes } from 'react';
import Modal from 'react-modal';

/**
 * Modal with UI for adding a new Project or Proposal
 */
export default class AddItemModal extends React.Component {

	static propTypes = {
		type: PropTypes.string.isRequired,	// 'Project', 'Proposal'
		isOpen: PropTypes.bool,
		onClose: PropTypes.func
	}

	static defaultProps = {
		onClose: () => {}
	}

	constructor (props) {

		super(props);
		this.state = {};

		this.onKeyDown = this.onKeyDown.bind(this);
		this.uploadMap = this.uploadMap.bind(this);
		this.closeModal = this.closeModal.bind(this);

	}

	componentWillReceiveProps (nextProps) {

		if (nextProps.isOpen === true) {
			window.addEventListener('keydown', this.onKeyDown);
			// TODO: add modal overlay click handler to close
		} else if (nextProps.isOpen === false) {
			window.removeEventListener('keydown', this.onKeyDown);
			// TODO: remove modal overlay click handler to close
		}

		// NOTE: while `isOpen` is controlled by parent component for opening the modal,
		// it is transformed into local state here so that the modal has control over closing itself
		// and triggering the onRequestClose callback.
		this.setState({
			isOpen: nextProps.isOpen,
			isClosing: false
		});

	}

	onKeyDown (event) {

		if (event.keyCode === 27) this.closeModal();

	}

	uploadMap () {

		// TODO: implement

	}

	closeModal (confirmed) {

		if (this.state.isClosing) return;

		this.props.onClose && this.props.onClose(confirmed ? {
			valueOne: 'foo'
		} : null);

		if (confirmed) {
			// TODO: display nicer loading indicator
			this.setState({ isClosing: true });
		}

	}

	render () {

		// let title = `Create new ${ this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1) }`;
		let title = `Create new ${ this.props.type }`;

		return (
			<Modal
				isOpen={ this.state.isOpen }
				className='add-item-modal'
				overlayClassName='add-item-modal-overlay'
			>
				{ this.state.isClosing ? 
					<div>
						Loading...
					</div>
					:
					<div>
						<h2>{ title }</h2>
						<p>Create a new Open Redistricting project. A project contains a single district map, and one or more proposals to revise it.</p>
						<form>
							<input className='name' placeholder='Project name'/>
							<textarea className='desc' placeholder='Project description'/>
						</form>
						<div className='button upload' onClick={ this.uploadMap }>Upload .geojson map</div>
						<div className='button-container'>
							<div className='button cancel' onClick={ () => this.closeModal(false) }>Cancel</div>
							<div className='button confirm' onClick={ () => this.closeModal(true) }>Finish</div>
						</div>
					</div>
				}
			</Modal>
		);
	}

}
