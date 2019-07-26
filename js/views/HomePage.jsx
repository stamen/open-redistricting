import React from 'react';

import AppContext from '../context';
import { githubOrgName, mapFilename } from '../../static/appConfig.json';
import auth from '../models/auth';
import ProjectThumb from '../components/ProjectThumb.jsx';
import LoginModal from '../components/LoginModal.jsx';
import AddItemModal from '../components/AddItemModal.jsx';

class HomePage extends React.Component {
	static contextType = AppContext;

    constructor (props) {
        super(props);

        this.state = {
			loginModalIsOpen: false,
			rateLimitModalIsOpen: false,
			addProjectModalIsOpen: false
		};
    }

    UNSAFE_componentWillMount () {

		if (~window.location.search.indexOf('rateLimit')) {
			this.setState({ rateLimitModalIsOpen: true });
			return;
		}

		// Don't fetch any data when rendering Auth route.
		if (window.location.hash.slice(0, 6) === '#/auth') return;

		this.context.actions.requestProjectList();

		let { viewer } = this.context.store.getState();
		if (typeof(viewer.isMember === 'undefined') && !viewer.loading) {
			this.context.actions.getViewer();
		}

		// If first time visiting site this session,
		// and not logged in, display intro + login CTA
		// let sessionStorage = window.sessionStorage;
		if (!auth.loggedIn() && (!sessionStorage || !sessionStorage['has-viewed-intro'])) {
			if (sessionStorage) window.sessionStorage['has-viewed-intro'] = true;
			window.setTimeout(() => {
				this.setState({ loginModalIsOpen: true });
			}, 1000);
		}

	}

    UNSAFE_componentWillReceiveProps (nextProps) {

		const storeState = this.context.store.getState(),
			projectList = storeState.projectList && storeState.projectList.data || [];

		if (typeof this.previousNumProjects !== 'undefined' && this.previousNumProjects !== projectList.length) {
			// new store state coming in with just-created project,
			// so close the modal
			delete this.previousNumProjects;
			this.setState({ addProjectModalIsOpen: false });
		}

	}

    openLoginModal = () => {

		this.setState({ loginModalIsOpen: true });

	};

    onLoginModalClose = confirmed => {

		this.setState({ loginModalIsOpen: false });
		if (confirmed) {
			auth.authorize(this.props.location.pathname, [ 'public_repo' ]);
		}

	};

    openAddProjectModal = () => {

		this.setState({ addProjectModalIsOpen: true });

	};

    onAddProjectModalClose = values => {

		if (!values) {
			this.setState({ addProjectModalIsOpen: false });
		} else {

			const storeState = this.context.store.getState(),
				projectList = storeState.projectList && storeState.projectList.data || [];
			this.previousNumProjects = projectList.length;

			let reader = new FileReader();
			reader.addEventListener('load', event => {
				let fileBase64 = reader.result.split(',')[1];
				this.context.actions.createProject(values.name, values.desc, fileBase64);
			});
			reader.readAsDataURL(values.file);

		}

	};

    render () {

    	console.log(">>>>> HomePage loginModalIsOpen:", this.state.loginModalIsOpen);

		const storeState = this.context.store.getState(),
			projectList = storeState.projectList && storeState.projectList.data || [];

		if (this.state.rateLimitModalIsOpen) {
			return this.renderRateLimitModal();
		} else {

			return (
				<div className='home-page page'>
					<h2 className='section-title'>All Projects</h2>
					<ul className='section recent-projects'>
						{ projectList.map(project => {
							return <li key={ project.id }>
								<ProjectThumb
									{ ...project }
									mapPath={ `https://raw.githubusercontent.com/${ githubOrgName }/${ project.name }/master/${ mapFilename }` }
									fetchJSON={ this.context.actions.fetchJSON }
								/>
							</li>;
						}) }
						{ storeState.viewer.isMember ? 
							<li key='add-project'>
								<div className='add-project' onClick={ this.openAddProjectModal }>
									<span className='plus'>+</span>add project
								</div>
							</li>
							: null
						}
					</ul>
					<AddItemModal
						type='project'
						desc='Create a new Open Redistricting project. A project contains a single district map, and one or more proposals to revise it.'
						isOpen={ this.state.addProjectModalIsOpen }
						onClose={ this.onAddProjectModalClose }
						className='add-item-modal'
					/>
					<LoginModal
						message={
							`This is Open Redistricting, a project that allows the public to participate in the state’s legislative redistricting process.<br>
							<br>
							Here you can review existing district maps, changes proposed to those districts, comment publicly about district boundaries and proposed changes, and make your own proposed modifications to districts.<br>
							<br>
							To participate fully on Open Redistricting, log in or sign up with GitHub below or at anytime via the link at the top of the page.<br>
							<div class="note-spacer"></div>
							<span style="font-weight: bold;">Note: </span><span style="font-style:italic">The site is currently in sandbox mode, and the projects here are not actual redistricting efforts.</span>`
						}
						buttonLabel='Log in / Sign up'
						isOpen={ this.state.loginModalIsOpen }
						onClose={ this.onLoginModalClose }
					/>
				</div>
			);

		}

	}

    renderRateLimitModal () {

		return (
			<div className='rate-limit-message'>
				<h2>Sorry!</h2>
				<p>In order to continue, you must either log in / sign up, or wait one hour. Unfortunately, our back end (GitHub) imposes a rate limit on unauthenticated API calls.</p>
				<div className='button login' onClick={ () => auth.authorize(null, [ 'public_repo' ]) }>Log in / Sign up</div>
			</div>
		);

	}
}

export default HomePage;
