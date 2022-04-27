import React from 'react';
import { connect } from 'react-redux';
import { Actions, Button, Manager, withTheme, Icon } from '@twilio/flex-ui';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';

import { CannedResponsesStyles } from './CannedResponses.Styles';

const templates = [
  { message: "Oi, meu nome é {agentName} e vou seguir com o seu atendimento. {agentEmail}", title: "Apresentação"},
  { message: "Oi, meu nome é {agentName} e vou seguir com o seu atendimento. Você poderia enviar os 3 primeiros digitos do seu CPF?", title: "Apresentação + CPF"},
  { message: "Obrigado, tenha um bom dia", title: "Encerramento"}
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

     Actions.invokeAction("SetInputText",{
      channelSid: this.props.channelSid,
      body: event.target.value
    });
  }

  handleClick = () => {
    this.setState({ hidden : !this.state.hidden, icon: this.state.icon === 'ArrowUp' ? "ArrowDown": "ArrowUp" });
  }

  processMessage = (message) => {
    const transformations = [
      (msg) => {
        const [agentName, ] =  Manager.getInstance().workerClient.attributes.full_name.split(" ")
        return msg.replaceAll("{agentName}", agentName)
      },
      (msg) => {
        const email =  Manager.getInstance().workerClient.attributes.email
        return msg.replaceAll("{agentEmail}", email)
      }
    ]

    transformations.forEach( transformation => {
      message = transformation(message)
    })

    return message
  }

  render() {
    return (
      <CannedResponsesStyles className="canned" >
        <Button className='templateButton' onClick={this.handleClick} ><Icon className='icon' icon={this.state.icon}/></Button>
        { !this.state.hidden && <FormControl className="form">
          <InputLabel className="input-label" htmlFor="response">Respostas Rápidas</InputLabel>
          <Select
            value={this.state.response}
            onChange={this.handleChange}
            name="response"
          >
            { templates.map( template =>
              ( <MenuItem value={this.processMessage(template.message)} key={template.title}>{template.title}</MenuItem>  )) }
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
