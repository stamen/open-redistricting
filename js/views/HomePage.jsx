import React from 'react';
import { withRouter } from 'react-router';

class HomePage extends React.Component {

	constructor (props) {

		super(props);

	}

	componentWillMount () {

		this.props.actions.requestProjectList();

	}

	shouldComponentUpdate () {
		console.log(">>>>> HomePage.shouldComponentUpdate()");
		return true;
	}

	componentWillUpdate () {

		console.log(">>>>> HomePage.componentWillUpdate()");

	}

	render () {

		console.log("HomePage.render()");
		const storeState = this.props.store.getState(),
			projectList = storeState.projectList && storeState.projectList.data || [];
		console.log(">>>>> projects:", projectList);

		// TODO: make ProjectThumb functional component

		return (
			<div className='home-page'>
				<ul className='recent-projects'>
				{ projectList.map(project => {
					return <li className='project-thumb' key={ project.id }>{ project.name }</li>;
				}) }
				</ul>
			</div>
		);

	}

}

export default withRouter(HomePage);
