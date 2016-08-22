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
						return <li key={ project.id }><ProjectThumb { ...project }/></li>;
					}) }
				</ul>
			</div>
		);

	}

}

export default withRouter(HomePage);
