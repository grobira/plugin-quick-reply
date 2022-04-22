import React from 'react';
import { connect } from 'react-redux';
import { Actions, Button, Manager, withTheme, Icon } from '@twilio/flex-ui';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { CannedResponsesStyles } from './CannedResponses.Styles';

const templates = [
  "Oi, meu nome é {agentName} e vou seguir com o seu atendimento.",
  "Oi, meu nome é {agentName} e vou seguir com o seu atendimento. Você poderia enviar os 3 primeiros digitos do seu CPF?",
  "Obrigado, tenha um bom dia"
]


class CannedResponses extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      response: '',
      hidden: true,
      icon: 'ArrowUp'
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });

    Actions.invokeAction('SendMessage', {
      channelSid: this.props.channelSid,
      body: event.target.value
    });
  }



  handleClick = (event) => {
    this.setState({ hidden : !this.state.hidden, icon: this.state.icon === 'ArrowUp' ? "ArrowDown": "ArrowUp" });
  }

  processMessage = (messageIndex) => {
    const [agentName, ] =  Manager.getInstance().workerClient.attributes.full_name.split(" ")
    return templates[messageIndex].replaceAll("{agentName}", agentName)
  }

  render() {
    return (
      <CannedResponsesStyles>
        <Button className='templateButton' onClick={this.handleClick} ><Icon className='icon' icon={this.state.icon}/></Button>
        { !this.state.hidden && <FormControl className="form">
          <InputLabel className="input-label" htmlFor="response">Respostas Rápidas</InputLabel>
          <Select
            value={this.state.response}
            onChange={this.handleChange}
            name="response"
          >
            <MenuItem value={this.processMessage(0)} title={this.processMessage(0)}>Apresentação Básica</MenuItem>
            <MenuItem value={this.processMessage(1)} title={this.processMessage(1)}>Apresentação + CPF</MenuItem>
            <MenuItem value={this.processMessage(2)} title={this.processMessage(2)}>Encerramento</MenuItem>
          </Select>
        </FormControl> }
      </CannedResponsesStyles>
    )
  }
};

const mapStateToProps = (state, ownProps) => {
  let currentTask = false;
  state.flex.worker.tasks.forEach((task) => {
    if (ownProps.channelSid === task.attributes.channelSid) {
      currentTask = task;
    }
  })

  return {
    state,
    currentTask,
  }
}

export default connect(mapStateToProps)(withTheme(CannedResponses));
