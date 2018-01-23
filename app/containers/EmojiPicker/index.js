import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import _ from 'lodash';
import { emojify } from 'react-emojione';
import TabBar from './TabBar';
import EmojiCategory from './EmojiCategory';
import styles from './styles';
import categories from './categories';
import scrollPersistTaps from '../../utils/scrollPersistTaps';
import database from '../../lib/realm';
import { emojisByCategory } from '../../emojis';

export default class extends PureComponent {
	static propTypes = {
		onEmojiSelected: PropTypes.func,
		tabEmojiStyle: PropTypes.object
	};

	constructor(props) {
		super(props);
		this.state = {
			frequentlyUsed: [],
			customEmojis: []
		};
		this.frequentlyUsed = database.objects('frequentlyUsedEmoji').sorted('count', true);
		this.customEmojis = database.objects('customEmojis');
		this.updateFrequentlyUsed = this.updateFrequentlyUsed.bind(this);
		this.updateCustomEmojis = this.updateCustomEmojis.bind(this);
	}

	componentWillMount() {
		this.frequentlyUsed.addListener(this.updateFrequentlyUsed);
		this.customEmojis.addListener(this.updateCustomEmojis);
		this.updateFrequentlyUsed();
		this.updateCustomEmojis();
	}

	componentWillUnmount() {
		this.frequentlyUsed.removeAllListeners();
		this.customEmojis.removeAllListeners();
	}

	onEmojiSelected(emoji) {
		if (emoji.isCustom) {
			const count = this._getFrequentlyUsedCount(emoji.content);
			this._addFrequentlyUsed({
				content: emoji.content, extension: emoji.extension, count, isCustom: true
			});
			this.props.onEmojiSelected(`:${ emoji.content }:`);
		} else {
			const content = emoji;
			const count = this._getFrequentlyUsedCount(content);
			this._addFrequentlyUsed({ content, count, isCustom: false });
			const shortname = `:${ emoji }:`;
			this.props.onEmojiSelected(emojify(shortname, { output: 'unicode' }), shortname);
		}
	}
	_addFrequentlyUsed = (emoji) => {
		database.write(() => {
			database.create('frequentlyUsedEmoji', emoji, true);
		});
	}
	_getFrequentlyUsedCount = (content) => {
		const emojiRow = this.frequentlyUsed.filtered('content == $0', content);
		return emojiRow.length ? emojiRow[0].count + 1 : 1;
	}
	updateFrequentlyUsed() {
		const frequentlyUsed = _.map(this.frequentlyUsed.slice(), (item) => {
			if (item.isCustom) {
				return item;
			}
			return emojify(`${ item.content }`, { output: 'unicode' });
		});
		this.setState({ frequentlyUsed });
	}

	updateCustomEmojis() {
		const customEmojis = _.map(this.customEmojis.slice(), item =>
			({ content: item.name, extension: item.extension, isCustom: true }));
		this.setState({ customEmojis });
	}

	renderCategory(category, i) {
		let emojis = [];
		if (i === 0) {
			emojis = this.state.frequentlyUsed;
		} else if (i === 1) {
			emojis = this.state.customEmojis;
		} else {
			emojis = emojisByCategory[category];
		}
		return (
			<EmojiCategory
				key={category}
				emojis={emojis}
				onEmojiSelected={emoji => this.onEmojiSelected(emoji)}
				style={styles.categoryContainer}
			/>
		);
	}

	render() {
		const scrollProps = {
			keyboardShouldPersistTaps: 'always'
		};
		return (
			<View style={styles.container}>
				<ScrollableTabView
					renderTabBar={() => <TabBar tabEmojiStyle={this.props.tabEmojiStyle} />}
					contentProps={scrollProps}
				>
					{
						_.map(categories.tabs, (tab, i) => (
							<ScrollView
								key={i}
								tabLabel={tab.tabLabel}
								{...scrollPersistTaps}
							>
								{this.renderCategory(tab.category, i)}
							</ScrollView>
						))
					}
				</ScrollableTabView>
			</View>
		);
	}
}
