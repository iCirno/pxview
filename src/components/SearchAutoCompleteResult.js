import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Platform,
  Animated,
  ListView,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard';
import Icon from 'react-native-vector-icons/FontAwesome';
import PXTouchable from './PXTouchable';
import Loader from './Loader';
import Separator from './Separator';
import SearchHistory from './SearchHistory';

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  row: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separatorContainer: {
    paddingLeft: 10, 
    paddingRight: 10
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
});

class SearchAutoCompleteResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      })
    };
  }

  componentDidMount() {
    const { dispatch, navigationStateKey, sortType, word, options } = this.props;
    dispatch(clearSearch(navigationStateKey, sortType));
    InteractionManager.runAfterInteractions(() => {
      this.search(word, options);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { options: prevOptions, word: prevWord } = this.props;
    const { dispatch, navigationStateKey, sortType, word, options } = nextProps;
    if ((word !== prevWord) || (options && options !== prevOptions)) {
      const { dataSource } = this.state;
      dispatch(clearSearch(navigationStateKey, sortType));
      this.search(word, options);
    }
  }
  
  componentWillReceiveProps(nextProps) {
    const { searchAutoComplete: { items: prevItems } } = this.props;
    const { searchAutoComplete: { items } } = nextProps;
    if (items && items !== prevItems) {
      const { dataSource } = this.state;
      this.setState({
        dataSource: dataSource.cloneWithRows(items)
      });
    }
  }

  renderRow = (item) => {
    const { onPressItem } = this.props;
    return (
      <PXTouchable 
        key={item} 
        onPress={() => onPressItem(item)}
      >
        <View style={styles.row}>
          <Text>{item}</Text>
        </View>
      </PXTouchable>
    )
  }

  renderSeparator = (sectionId, rowId) => {
    return (
      <Separator key={`${sectionId}-${rowId}`} />
    )
  }

  render() {
    const { searchAutoComplete: { items, loading, loaded },  searchHistory, onPressItem, onPressSearchHistoryItem, onPressRemoveSearchHistoryItem, onPressClearSearchHistory } = this.props;
    const { dataSource } = this.state;
    return (
      <View style={styles.container}>
        {
          !loaded && !loading &&
          <SearchHistory 
            items={searchHistory.items}
            onPressItem={onPressSearchHistoryItem}
            onPressRemoveSearchHistoryItem={onPressRemoveSearchHistoryItem}
            onPressClearSearchHistory={onPressClearSearchHistory}
          />
        }
        {
          !loaded && loading &&
          <Loader />
        }
        {
          (items && items.length) ?
          <ListView 
            dataSource={dataSource}
            renderRow={this.renderRow}
            renderSeparator={this.renderSeparator}
            enableEmptySections={true}
            keyboardShouldPersistTaps="always"
            onScroll={dismissKeyboard}
          />
          :
          null
        }
      </View>
    );
  }
}

export default SearchAutoCompleteResult;
