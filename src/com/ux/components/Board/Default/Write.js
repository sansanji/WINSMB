/* *
 * Import Common
 * */
import {
  View,
  Text,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { React, Upload, Navigation, bluecolor } from 'libs';
import { Touchable } from 'ux';
/* *
 * Import node_modules
 * */
import ImagePicker from 'react-native-image-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';
import HTextarea from 'components/Form/Text/HTextarea';
import AutoSearch from 'components/Form/AutoSearch';

/**
 * 게시판 쓰기 컴포넌트
 */
class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      content: this.props.CONTENT || '',
      photos: [],
      contentHeight: 60,
      isAttachable: this.props.isAttachable,
      REF_NO: this.props.REF_NO || '',
    };
    this.contentInput = null;
  }

  componentWillReceiveProps(nextProps) {
    // if (this.props.isAttachable !== nextProps.isAttachable) {
    this.setState({
      isAttachable: nextProps.isAttachable,
      REF_NO: nextProps.REF_NO,
    });
    // }
  }

  _attachPhoto() {
    Keyboard.dismiss();
    // More info on all the options is below in the README...just some common use cases shown here
    const options = {
      title: 'Please choose photo',
      // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    /**
     * The first arg is the options object for customization (it can also be null or omitted for default options),
     * The second arg is the callback which sends object: response (more info below in README)
     */
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.uri;

        // You can also display the image using data:
        // const source = `data:image/jpeg;base64,${response.data}`;

        this.setState({
          photos: [...this.state.photos, source],
        });
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        // this.setState({
        //   avatarSource: source,
        // });
        // this.props.navigator.popToRoot();
        console.log('fetch-log', 'source', source);
        const fileConfig = {
          pickType: 'IMAGE',
          callView: 'Write',
          fileUri: response.uri,
          fileType: response.path,
          fileName: response.fileName,
          fileSize: response.fileSize || 0,
        };
        Upload({
          companyCode: 'HTNS',
          refNo: this.state.REF_NO, // 'cdyoo42',
          refType: 'RM',
          sFuncCode: 'MB',
          fileConfig,
          onProgress: progress => {
            console.log('fetch-log', 'file uploaded progress', progress);
          },
          onSuccess: res => {
            console.log('fetch-log', 'file uploaded success', res);
          },
          onError: err => {
            console.log('fetch-log', 'file uploaded error', err);
          },
        });
      }
      // Navigation(this.props.navigator, 'POP'); // 첨부저장 후 창 닫기
      // let xhr = new XMLHttpRequest();
      // xhr.open('POST', 'http://192.168.0.42:8080/api/file/upload');
      // xhr.setRequestHeader('content-type', 'multipart/form-data');
      // let formdata = new FormData();
      // // image from CameraRoll.getPhotos(
      // formdata.append('image', {...image, name: 'image.jpg', type: 'image/jpeg'});
      // xhr.send(formdata);
    });
  }

  _onCancel() {
    const { componentId } = this.props;
    Navigation(componentId, 'POP');
  }

  _removePhoto(index) {
    const { photos } = this.state;
    this.setState({
      photos: [...photos.slice(0, index), ...photos.slice(index + 1)],
    });
  }

  // <ActivityIndicator animating style={[styles.centering, { height: 80 }]} size="large" />
  render() {
    const secondBlueColor = '#2c7bba';
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {this.props.onChangeTitle != null ? (
            <View style={styles.titleContainer}>
              <TextInput
                style={{ fontSize: 18, padding: 0, flex: 1 }}
                underlineColorAndroid={'#f1f1f1'}
                placeholder={this.props.TITLE != null ? this.props.TITLE : 'Please input a title'}
                onChangeText={title => {
                  this.setState({ title }, () => {
                    this.props.onChangeTitle(title);
                  });
                }}
                value={this.state.title}
              />
            </View>
          ) : null}
          <View style={styles.contentsContainer}>
            <HTextarea
              ref={input => {
                this.contentInput = input;
              }}
              placeholder={this.props.CONTENT != null ? this.props.CONTENT : 'Please input a memo'}
              style={{
                fontSize: 18,
                padding: 0,
                flex: 1,
                textAlignVertical: 'top',
              }}
              underlineColorAndroid={'#f1f1f1'}
              onChangeText={content => {
                this.setState({ content }, () => {
                  this.props.onChangeContent(content);
                });
              }}
              value={this.state.content}
            />
          </View>
          {this.props.useLocation === true ? (
            <View style={styles.locationContainer}>
              <View style={{ width: 80 }}>
                <Text>위치</Text>
              </View>
              <View style={{ flex: 1 }}>
                <AutoSearch keyword={this.props.location} onChange={this.props.onChangeLocation} />
              </View>
            </View>
          ) : null}
          {this.state.isAttachable === true ? (
            <View>
              <View style={styles.attachContainer}>
                <View style={{ width: 80 }}>
                  <Text style={{ color: secondBlueColor }}>Attached File</Text>
                </View>
                <View style={{ flex: 1 }}>
                  {this.state.photos.length < 8 ? (
                    <View style={{ width: 170 }}>
                      <Button
                        icon={{ name: 'photo', type: 'font-awesome' }}
                        title="Attach Photo"
                        backgroundColor="#517fa4"
                        onPress={() => this._attachPhoto()}
                        borderRadius={10}
                      />
                    </View>
                  ) : null}
                </View>
                <View>
                  <Text style={{ color: secondBlueColor }} />
                </View>
              </View>
              <ScrollView
                horizontal
                style={styles.photoContainer}
                keyboardShouldPersistTaps={'always'}
              >
                {this.state.photos.map((photo, index) => (
                  <View>
                    <Image
                      source={{ uri: photo,
                        headers: {
                          'X-CSRF-TOKEN': globalThis.gToken,
                          Cookie: globalThis.gCookie,
                          // withCredentials: true,
                        } }}
                      style={{ width: 100, height: 100, borderWidth: 1, marginLeft: 10 }}
                    />
                    <Touchable
                      onPress={() => this._removePhoto(index)}
                      style={{
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        zIndex: 1,
                        right: 5,
                        top: 5,
                      }}
                    >
                      <FontAwesome name="remove" size={30} color="red" />
                    </Touchable>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
          {this.state.isAttachable === false ? (
            <View style={styles.buttonContainer}>
              <View style={{ flex: 1, paddingRight: 5 }}>
                <Button
                  icon={{ name: 'ban', type: 'font-awesome' }}
                  title="Cancel"
                  backgroundColor="#d85048"
                  onPress={() => this._onCancel()}
                  borderRadius={10}
                />
              </View>
              <View style={{ flex: 1, paddingLeft: 5 }}>
                <Button
                  icon={{ name: 'save', type: 'font-awesome' }}
                  title="Save"
                  backgroundColor="#517fa4"
                  onPress={() => this.props.onComplete()}
                  borderRadius={10}
                />
              </View>
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

/**
 * Define component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  titleContainer: {
    marginBottom: 20,
    height: 50,
    margin: 0,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: bluecolor.basicBlueColor,
    backgroundColor: '#fff',
  },
  contentsContainer: {
    marginBottom: 20,
    padding: 10,
    height: 130,
    borderBottomWidth: 1,
    borderColor: bluecolor.basicBlueColor,
    backgroundColor: '#fff',
  },
  attachContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  photoContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: bluecolor.basicBlueColor,
    padding: 10,
    paddingLeft: 0,
    height: 125,
  },
});

export default Component;
