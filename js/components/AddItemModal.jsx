import React, { PropTypes } from 'react';
import Modal from 'react-modal';

/**
 * Modal with UI for adding a new Project or Proposal
 */
export default class AddItemModal extends React.Component {

	static propTypes = {
		type: PropTypes.string.isRequired,	// 'project', 'proposal', 'revision'
		desc: PropTypes.string,
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
		// However, current state is preserved when the modal is remaining open.
		if (!nextProps.isOpen || !this.state.isOpen) {
			this.setState({
				isOpen: nextProps.isOpen,
				isClosing: false,
				selectedFile: null
			});
		}

	}

	componentDidUpdate () {

		if (this.overlayClickHandlerInited || !this.state.isOpen) return;

		// Give modal overlay time to open
		setTimeout(() => {
			let overlay = document.querySelector('.add-item-modal-overlay');
			if (!overlay) return;

			overlay.addEventListener('click', this.onOverlayClicked.bind(this));
			this.overlayClickHandlerInited = true;
		}, 100);

	}

	onKeyDown (event) {

		switch (event.keyCode) {
			case 13:	// enter
				this.closeModal(true);
				break;
			case 27:	// escape
				this.closeModal(false);
				break;
		}

	}

	onOverlayClicked (event) {

		let overlay = document.querySelector('.add-item-modal-overlay')
		if (event.target === overlay) this.closeModal(false);
		
	}

	uploadMap () {

		let fileInput = this.refs.uploadInput,
			onFileSelect = event => {
				let file = fileInput.files[0];
				fileInput.removeEventListener('change', onFileSelect);
				this.setState({ selectedFile: file || null });
			};

		fileInput.addEventListener('change', onFileSelect);
		fileInput.click();

	}

	closeModal (confirmed) {

		if (this.state.isClosing) return;
		if (confirmed && !this.state.selectedFile) return;

		this.props.onClose && this.props.onClose(confirmed ? {
			file: this.state.selectedFile,
			name: this.refs.nameInput ? this.refs.nameInput.value : null,
			desc: this.refs.descInput.value
		} : null);

		if (confirmed) this.setState({ isClosing: true });

	}

	render () {

		let title = `Create new ${ this.props.type }`,
			cappedType = this.props.type.slice(0, 1).toUpperCase() + this.props.type.slice(1),
			confirmEnabled =
				this.state.selectedFile
				&& (this.props.type === 'revision' || (this.refs.nameInput && this.refs.nameInput.value))
				&& (this.refs.descInput && this.refs.descInput.value);

		return (
			<Modal
				isOpen={ this.state.isOpen }
				className='add-item-modal'
				overlayClassName='add-item-modal-overlay'
				contentLabel={ title || 'Add a new item' }
			>
				{ this.state.isClosing ? 
					<div className='loader'>
						<h2>{ `Creating ${ this.props.type }...` }</h2>
					</div>
					:
					<div>
						<h2>{ title }</h2>
						<p className='modal-desc'>{ this.props.desc || '' }</p>
						<form>
							{ this.props.type !== 'revision' ?
								<input className='name' ref='nameInput' placeholder={ `${ cappedType } name` } />
								: null
							}
							<textarea className='desc' ref='descInput' placeholder={ `${ cappedType } description` } />
						</form>

						<input type='file' accept='.geojson' ref='uploadInput' style={{ display: 'none' }} />
						<div className='button upload' onClick={ this.uploadMap }>Upload .geojson map</div>
						<div className='upload-info'>{ this.state.selectedFile ? `✓ ${ this.state.selectedFile.name }` : '' }</div>

						<div className='button-container'>
							<div className='button cancel' onClick={ () => this.closeModal(false) }>Cancel</div>
							<div className={ `button confirm${ !confirmEnabled ? ' disabled' : '' }` } onClick={ () => this.closeModal(true) }>Finish</div>
						</div>
					</div>
				}
			</Modal>
		);
	}

}
