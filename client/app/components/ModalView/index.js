import React from 'react';
import styles from '../Tweet/styles';


class ModalView extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {

    let modalWrap = {
      'position': 'relative',
      'display': 'inline-block',
      'verticalAlign': 'middle',
      'margin': '0 auto',
      'zIndex': 20
    }

    return (
      <div className="Modal" style={styles.Modal}>
        <span style={{'height': '100%', 'display': 'inline-block', 'verticalAlign': 'middle'}} />
        <div className="ModalClose" style={styles.ModalClose} onClick={this.props.closeModal} />
        <div className="Modal-wrap" style={modalWrap}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ModalView
