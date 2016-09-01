import React from 'react';
import { withRouter } from 'react-router';

import ProjectThumb from '../components/ProjectThumb.jsx';

class HomePage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		this.props.actions.requestProjectList();

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
				</ul>
			</div>
		);

	}

}

export default withRouter(HomePage);
