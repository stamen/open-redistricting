import React from 'react';
import { withRouter } from 'react-router';

import ProjectThumb from '../components/ProjectThumb.jsx';

class HomePage extends React.Component {

	constructor (props) {

		super(props);
		this.openNewProjectModal = this.openNewProjectModal.bind(this);

	}

	componentWillMount () {

		this.props.actions.requestProjectList();

		let { viewer } = this.props.store.getState();
		if (typeof(viewer.isMember === 'undefined') && !viewer.loading) {
			this.props.actions.authedUserIsMember();
		}

	}

	openNewProjectModal () {

		console.log(">>>>> TODO: open new project modal");

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
							<ProjectThumb
								{ ...project }
							/>
							
							{/*

							TODO: programmatically set a standard name for the single geojson file uploaded per project.
							this will remove the need to make the repo contents call from the whole site,
							and is especially important here, where we would have to make that call for every repo.
							then, instead of `project.contents.map.name`, we just hardcode that geojson filename.

							<ProjectThumb
								{ ...project }
								mapPath={ `https://raw.githubusercontent.com/${ this.props.params.owner }/${ this.props.params.projectId }/master/${ project.contents.map.name }` }
								fetchJSON={ this.props.actions.fetchJSON }
							/>
							*/}

						</li>;
					}) }
					{ storeState.viewer.isMember ? 
						<li key='add-project'>
							<div className='add-project' onClick={ this.openNewProjectModal }>
								<span className='plus'>+</span>add project
							</div>
						</li>
						: null
					}
				</ul>
			</div>
		);

	}

}

export default withRouter(HomePage);
