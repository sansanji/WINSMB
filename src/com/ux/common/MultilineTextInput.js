import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import debounce from 'debounce';

/**
 * This is a workaround for the buggy react-native TextInput multiline on Android.
 *
 * Can be removed once https://github.com/facebook/react-native/issues/12717
 * is fixed.
 *
 * Example for usage:
 *   <MultilineTextInput value={this.state.text} onChangeText={text => setState({text})} />
 */
class MultilineTextInput extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { selection: { start: 0, end: 0 } };
    // Prevent 2 newlines for some Android versions, because they dispatch onSubmitEditing twice
    this.onSubmitEditing = debounce(this.onSubmitEditing.bind(this), 1000, true);
  }
  componentWillReceiveProps(props) {
    if (props.selection) {
      this.setState({ selection: props.selection });
    }
  }

  // focus() {
  //   this.refs.text.focus();
  // }

  onSubmitEditing() {
    const { selection } = this.state;
    const { value } = this.props;
    const newText = `${value.slice(0, selection.start)}\n${value.slice(selection.end)}`;

    this.props.onChangeText(newText);

    // move cursor only for this case, because in other cases a change of the selection is not allowed by Android
    if (selection.start !== this.props.value.length && selection.start === selection.end) {
      const newSelection = {
        selection: {
          start: selection.start + 1,
          end: selection.end + 1,
        },
      };
      if (this.props.onSelectionChange) {
        this.props.onSelectionChange({ nativeEvent: newSelection });
      } else {
        this.setState(newSelection);
      }
    }
  }
  render() {
    return (
      <TextInput
        ref="text"
        multiline
        blurOnSubmit={false}
        selection={this.state.selection}
        value={this.props.value}
        onSelectionChange={event => this.setState({ selection: event.nativeEvent.selection })}
        onChangeText={this.props.onChangeText}
        onSubmitEditing={this.onSubmitEditing}
        {...this.props}
      />
    );
  }
}

// MultilineTextInput.propTypes = {
//   value: PropTypes.string.isRequired,
//   onChangeText: PropTypes.func.isRequired,
// };

export default MultilineTextInput;
