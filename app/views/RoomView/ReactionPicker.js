import React from 'react';
import PropTypes from 'prop-types';
import { View, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import EmojiPicker from '../../containers/EmojiPicker';
import { toggleReactionPicker } from '../../actions/messages';

const { width } = Dimensions.get('window');

@connect(state => ({
	showReactionPicker: state.messages.showReactionPicker
}), dispatch => ({
	toggleReactionPicker: message => dispatch(toggleReactionPicker(message))
}))
export default class extends React.PureComponent {
	static propTypes = {
		showReactionPicker: PropTypes.bool,
		toggleReactionPicker: PropTypes.func,
		onEmojiSelected: PropTypes.func
	};

	onEmojiSelected(emoji, shortname) {
		// standard emojis: `emoji` is unicode and `shortname` is :joy:
		// custom emojis: only `emoji` is returned with shortname type (:joy:)
		// to set reactions, we need shortname type
		this.props.onEmojiSelected(shortname || emoji);
	}

	render() {
		return (
			<Modal
				isVisible={this.props.showReactionPicker}
				style={{ alignItems: 'center' }}
				onBackdropPress={() => this.props.toggleReactionPicker()}
				onBackButtonPress={() => this.props.toggleReactionPicker()}
				animationIn='fadeIn'
				animationOut='fadeOut'
			>
				<View
					style={{
						width: width - 20,
						height: width - 20,
						backgroundColor: '#F7F7F7',
						borderRadius: 4,
						flexDirection: 'column'
					}}
				>
					<EmojiPicker
						tabEmojiStyle={{ fontSize: 15 }}
						onEmojiSelected={(emoji, shortname) => this.onEmojiSelected(emoji, shortname)}
					/>
				</View>
			</Modal>
		);
	}
}