import React from 'react';
import { Route } from 'react-router-dom';
import get from 'lodash.get';
import moment from 'moment';

import AppContext from '../context';
import { mapFilename } from '../../static/appConfig.json';
import { deriveProjectId } from '../models/reducers';
import ProposalThumb from '../components/ProposalThumb.jsx';
import AddItemModal from '../components/AddItemModal.jsx';


class ProjectPage extends React.Component {
	static contextType = AppContext;

	state = {
		modalIsOpen: false
	};

	componentDidMount () {

		this.context.actions.requestProject(this.props.match.params.projectId);

		let { viewer } = this.context.store.getState();
		if (typeof(viewer.isSignedIn === 'undefined') && !viewer.loading) {
			this.context.actions.getViewer();
		}

	}

    UNSAFE_componentWillReceiveProps (nextProps) {

		const storeState = this.context.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.match.params.owner, this.props.match.params.projectId)];
		let proposals = get(project, 'proposals') || {};

		if (typeof this.previousNumProposals !== 'undefined' && this.previousNumProposals !== Object.keys(proposals).length) {
			// new store state coming in with just-created proposal,
			// so close the modal
			delete this.previousNumProposals;
			this.setState({ modalIsOpen: false });
		}

	}

    openModal = () => {

		this.setState({ modalIsOpen: true });

	};

    onModalClose = values => {

		if (!values) {
			this.setState({ modalIsOpen: false });
		} else {

			const storeState = this.context.store.getState(),
				project = storeState.projects[deriveProjectId(this.props.match.params.owner, this.props.match.params.projectId)],
				viewerId = get(storeState, 'viewer.login');

			if (!project || !viewerId) return;

			let proposals = get(project, 'proposals') || {};
			this.previousNumProposals = Object.keys(proposals).length;

			let reader = new FileReader();
			reader.addEventListener('load', event => {
				let fileBase64 = reader.result.split(',')[1];
				this.context.actions.createProposal(values.name, values.desc, fileBase64, this.props.match.params.projectId, viewerId);
			});
			reader.readAsDataURL(values.file);

		}

	};

    render () {

		const storeState = this.context.store.getState(),
			project = storeState.projects[deriveProjectId(this.props.match.params.owner, this.props.match.params.projectId)];
		let proposals = get(project, 'proposals') || {};

		proposals = Object.keys(proposals)
			.map(k => proposals[k])
			.sort((a, b) => moment(a.updated_at) - moment(b.updated_at));	// most recently-updated first

		let body;
		if (!project || project.loading) {

			body = <div>Loading...</div>;

		} else {
			if (proposals.length) {

				body = (
					<ul>
						{ proposals.map(proposal => {
							return (
								<li key={ proposal.id }>
									<ProposalThumb
										projectMetadata={ project.metadata }
										mapPath={ `https://raw.githubusercontent.com/${ this.props.match.params.owner }/${ this.props.match.params.projectId }/${ proposal.head.sha }/${ mapFilename }` }
										fetchJSON={ this.context.actions.fetchJSON }
										{ ...proposal }
									/>
								</li>
							);
						}) }
						{ storeState.viewer.isSignedIn ? 
							<li key='add-project'>
								<div className='add-project' onClick={ this.openModal }>
									<span className='plus'>+</span>add proposal
								</div>
							</li>
							: null
						}
					</ul>
				);

			} else {

				body = (
					<div>
						No proposals created yet.
						<ul>
							{ storeState.viewer.isSignedIn ? 
								<li key='add-project'>
									<div className='add-project' onClick={ this.openModal }>
										<span className='plus'>+</span>add proposal
									</div>
								</li>
								: null
							}
						</ul>
					</div>
				);

			}
		}

		return (
			<div className='project-page page'>
				<h2 className='project-name'>{ get(project, 'metadata.name') || '' }</h2>
				<p className='project-desc'>{ get(project, 'metadata.description') || '' }</p>
				{ body }
				<AddItemModal
					type='proposal'
					desc={ `Create a new proposal to edit your project's district map.\u000AUpload a revision to the map file for this project.` }
					isOpen={ this.state.modalIsOpen }
					onClose={ this.onModalClose }
					className='add-item-modal'
				/>
			</div>
		);

	}
}

export default ProjectPage;
