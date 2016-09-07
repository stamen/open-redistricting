import React, { PropTypes } from 'react';
import Modal from 'react-modal';

/**
 * Modal with UI for adding a new Project or Proposal
 */
export default class AddItemModal extends React.Component {

	static propTypes = {
		type: PropTypes.string.isRequired,	// 'Project', 'Proposal'
		isOpen: PropTypes.bool,
		onClose: PropTypes.func,
		styles: PropTypes.object
	}

	static defaultProps = {
		onClose: () => {},
		styles: {}
	}

	static styles = {
		overlay: {
			backgroundColor: 'rgba(0, 0, 0, 0.5)'
		},
		content: {
			left: '30%',
			right: '30%',
			top: '15%',
			bottom: '40%',
			borderRadius: '0',
			padding: '1rem'
		}
	}

	constructor (props) {

		super(props);
		this.state = {};

		this.onKeyDown = this.onKeyDown.bind(this);
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
			isOpen: nextProps.isOpen
		});

	}

	onKeyDown (event) {

		if (event.keyCode === 27) this.closeModal();

	}

	closeModal (confirmed) {

		this.props.onClose && this.props.onClose(confirmed ? {
			valueOne: 'foo'
		} : null);

		console.log(">>>>> TODO: display loading indicator until closed by parent");

	}

	render () {

		let styles = {
				...AddItemModal.styles,
				...this.props.styles
			};

		return (
			<Modal
				isOpen={ this.state.isOpen }
				style={ styles }
			>
				<h2 ref="subtitle">Hello</h2>
				<button onClick={ () => this.closeModal(false) }>cancel</button>
				<button onClick={ () => this.closeModal(true) }>confirm</button>
				<div>I am a modal</div>
				<form>
					<input />
					<button>tab navigation</button>
					<button>stays</button>
					<button>inside</button>
					<button>the modal</button>
				</form>
			</Modal>
		);
	}

}
