import React from 'react';
import { withRouter } from 'react-router';

import { githubOrgName, mapFilename } from '../../static/appConfig.json';
import ProjectThumb from '../components/ProjectThumb.jsx';
import AddItemModal from '../components/AddItemModal.jsx';

class HomePage extends React.Component {

	constructor (props) {

		super(props);

		this.openModal = this.openModal.bind(this);
		this.onModalClose = this.onModalClose.bind(this);

		this.state = {};

	}

	componentWillMount () {

		this.props.actions.requestProjectList();

		let { viewer } = this.props.store.getState();
		if (typeof(viewer.isMember === 'undefined') && !viewer.loading) {
			this.props.actions.authedUserIsMember();
		}

	}

	componentWillReceiveProps (nextProps) {

		const storeState = nextProps.store.getState(),
			projectList = storeState.projectList && storeState.projectList.data || [];

		if (typeof this.previousNumProjects !== 'undefined' && this.previousNumProjects !== projectList.length) {
			// new store state coming in with just-created project,
			// so close the modal
			delete this.previousNumProjects;
			this.setState({ modalIsOpen: false });
		}

	}

	openModal () {

		this.setState({ modalIsOpen: true });

	}

	onModalClose (values) {

		if (!values) {
			this.setState({ modalIsOpen: false });
		} else {

			const storeState = this.props.store.getState(),
				projectList = storeState.projectList && storeState.projectList.data || [];
			this.previousNumProjects = projectList.length;

			let reader = new FileReader();
			reader.addEventListener('load', event => {
				let fileBase64 = reader.result.split(',')[1];
				this.props.actions.createProject(values.name, values.desc, fileBase64);
			});
			reader.readAsDataURL(values.file);

		}

	}

	render () {

		const storeState = this.props.store.getState(),
			projectList = storeState.projectList && storeState.projectList.data || [];

		return (
			<div className='home-page page'>
				<h2 className='section-title'>All Projects</h2>
				<ul className='section recent-projects'>
					{ projectList.map(project => {
						return <li key={ project.id }>
							{/*
								TODO: programmatically set a standard name for the single geojson file uploaded per project.
								this will remove the need to make the repo contents call from the whole site,
								and is especially important here, where we would have to make that call for every repo.
								then, instead of `project.contents.map.name`, we just hardcode that geojson filename.
							*/}
							<ProjectThumb
								{ ...project }
								mapPath={ `https://raw.githubusercontent.com/${ githubOrgName }/${ project.name }/master/${ mapFilename }` }
								fetchJSON={ this.props.actions.fetchJSON }
							/>
						</li>;
					}) }
					{ storeState.viewer.isMember ? 
						<li key='add-project'>
							<div className='add-project' onClick={ this.openModal }>
								<span className='plus'>+</span>add project
							</div>
						</li>
						: null
					}
				</ul>
				<AddItemModal
					type='project'
					isOpen={ this.state.modalIsOpen }
					onClose={ this.onModalClose }
					className='add-item-modal'
				/>
			</div>
		);

	}

}

export default withRouter(HomePage);
