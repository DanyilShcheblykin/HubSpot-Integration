import { ChangeEvent, Component, FormEvent, ReactNode } from "react";
import "./styles/form.scss";

interface PropsConact {
  firstname: string;
  email: string;
  message: string;
}

interface PropsDeal {
  dealname: string;
}

interface PropsNote {
  hs_timestamp: Date;
  hs_note_body: string;
}

interface PropsAssociations {
  object: string;
  objectId: number;
  toObjectType: string;
  toObjectId: number;
  associationType: string;
}

interface ObjectsId {
  ContactId: number;
  DealsId: number;
  NotesId: number;
}

type Props = {};
class Form extends Component<{}, PropsConact> {
  constructor(props: Props) {
    super(props);
    this.state = {
      firstname: " ",
      email: " ",
      message: " ",
    };
    this.nameChange = this.nameChange.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.messageChange = this.messageChange.bind(this);
  }

  getContactModal (){
    return{
      firstname: this.state.firstname,
      email:this.state.email,
      message:this.state.message,
    }
  }

  requestProperties() {
    return [
      {
        firstname: `${this.state.firstname}`,
        email: `${this.state.email}`,
        message: `${this.state.message}`,
      },
      {
        dealname: `RR-WebSiite:${this.state.firstname}`,
      },
      {
        hs_timestamp: new Date(),
        hs_note_body: `Name: ${this.state.firstname}, <br />
          Email: ${this.state.email}, <br />
          Message: ${this.state.message}, <br />`,
      },
    ];
  }

  getHubspotAssociationsURL = (params: PropsAssociations) => {
    const { object, objectId, toObjectType, toObjectId, associationType } =
      params;
    return `https://api.hubapi.com/crm/v3/objects/${object}/${objectId}/associations/${toObjectType}/${toObjectId}/${associationType}?hapikey=eu1-d8e8-5c5d-45df-8b61-f9485a1d172d`;
  };

  getHubSpotUrl = (object: string) => {
    return `https://api.hubapi.com/crm/v3/objects/${object}?hapikey=eu1-d8e8-5c5d-45df-8b61-f9485a1d172d`;
  };

  getAssociationsProp = () => {
    return {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000/",
        "x-requested-with": "http://localhost:3000/",
        "X-RapidAPI-Key": "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
        "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
      },
    };
  };
  getObjectProps = (props: PropsConact | PropsDeal | PropsNote) => {
    return {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000//",
        "x-requested-with": "http://localhost:3000/",
        "X-RapidAPI-Key": "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
        "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
      },
      body: JSON.stringify({ properties: props }),
    };
  };

  nameChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ firstname: event.target.value });
  };

  emailChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  messageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ message: event.target.value });
  };

  ExistEmailOrNot = async (email: string) => {
    const ProxyUrl: string = "https://http-cors-proxy.p.rapidapi.com/";
    const res = await fetch(
      `${ProxyUrl}https://api.hubapi.com/crm/v3/objects/contacts/search?hapikey=eu1-d8e8-5c5d-45df-8b61-f9485a1d172d`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000//",
          "x-requested-with": "http://localhost:3000/",
          "X-RapidAPI-Key":
            "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
          "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: email,
                },
              ],
            },
          ],
        }),
      }
    );
    return await res.json();
  };

  getObjectId(object: string, numberProp: number) {
    const ProxyUrl: string = "https://http-cors-proxy.p.rapidapi.com/";

    return fetch(
      `${ProxyUrl}${this.getHubSpotUrl(object)}`,
      this.getObjectProps(this.requestProperties()[numberProp])
    )
      .then((data) => {
        return data.json();
      })
      .then((resp) => {
        return resp.id;
      });
  }

  createAssociationsParams(props: PropsAssociations) {
    return {
      object: props.object,
      objectId: props.objectId,
      toObjectType: props.toObjectType,
      toObjectId: props.toObjectId,
      associationType: props.associationType,
    };
  }

  requestForAssociations = async (paramsForAssociations: PropsAssociations) => {
    const ProxyUrl: string = "https://http-cors-proxy.p.rapidapi.com/";

    await fetch(
      `${ProxyUrl}${this.getHubspotAssociationsURL(paramsForAssociations)}`,
      this.getAssociationsProp()
    );
  };

  async createAssociations(objectId: ObjectsId) {
    const dealsToContactsProps = {
      object: "deals",
      objectId: objectId.DealsId,
      toObjectType: "contacts",
      toObjectId: objectId.ContactId,
      associationType: "deal_to_contact",
    };
    const notesToContactsProps = {
      object: "notes",
      objectId: objectId.NotesId,
      toObjectType: "contacts",
      toObjectId: objectId.ContactId,
      associationType: "note_to_contact",
    };

    const notesToDealsProps = {
      object: "notes",
      objectId: objectId.NotesId,
      toObjectType: "deals",
      toObjectId: objectId.DealsId,
      associationType: "note_to_deal",
    };

    const dealsToContacts = this.createAssociationsParams(dealsToContactsProps);

    const notesToContacts = this.createAssociationsParams(notesToContactsProps);

    const notesToDeals = this.createAssociationsParams(notesToDealsProps);

    await this.requestForAssociations(dealsToContacts);
    await this.requestForAssociations(notesToContacts);
    await this.requestForAssociations(notesToDeals);
  }

  updateContact = async (contactId :number, data : PropsConact) => {
    const ProxyUrl: string = "https://http-cors-proxy.p.rapidapi.com/";

    const res = await fetch(`${ProxyUrl}https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?hapikey=eu1-d8e8-5c5d-45df-8b61-f9485a1d172d`, {
        method: 'PATCH',
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000//",
          "x-requested-with": "http://localhost:3000/",
          "X-RapidAPI-Key":
            "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
          "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
        },
        body: JSON.stringify({
            properties: data
        })
    });
    return res
}

  getContactId = async () => {
    const response = await this.ExistEmailOrNot(this.state.email);
 
    if (response.total > 0) {
      console.log(" Должно ")
      const name = response.results[0].properties.firstname;
      if (name !== this.state.firstname) {
        return response.results[0].id;
      }
    } else {
      console.log("не должно ")
      return this.getObjectId("contacts", 0);
    }
  };

  getAllIdFromObjects = async () => {
    enum RequestProp {
      forDeals = 1,
      forNotes = 2,
    }

    

    let ContactId = await this.getContactId();

    let DealsId: number = await this.getObjectId("deals", RequestProp.forDeals);

    let NotesId: number = await this.getObjectId("notes", RequestProp.forNotes);

    if (!ContactId || !DealsId || !NotesId) {
      throw Error;
    }
    return {
      ContactId: ContactId,
      DealsId: DealsId,
      NotesId: NotesId,
    };
  };

  sendTohubSpot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const objId = await this.getAllIdFromObjects();

    const { ContactId, DealsId, NotesId } = objId;

    this.createAssociations({ ContactId, DealsId, NotesId });
  };

  render(): ReactNode {
    return (
      <>
        <div>
          <h1>{this.state.firstname}</h1>
          <form
            onSubmit={(event) => this.sendTohubSpot(event)}
            className="form"
            action=""
          >
            <h1>Now, let's bring your ideas to life.</h1>
            <div>
              <input
                onChange={(event) => this.nameChange(event)}
                placeholder="name"
                name="dealname"
                type="text"
                id=""
                value={this.state.firstname}
              />
            </div>

            <div>
              <input
                placeholder="email"
                type="email"
                onChange={(event) => this.emailChange(event)}
                value={this.state.email}
              />
            </div>
            <div>
              <textarea
                onChange={(event) => this.messageChange(event)}
                className="textarea"
                placeholder="message"
                name="message"
                value={this.state.message}
              ></textarea>
            </div>
            <p className="bySub">
              By submitting a completed form, your personal data will be
              processed by RedRocket Group. Please read our{" "}
              <a href="#">Privacy Policy</a> for more information. If you have
              any questions regarding your rights or would subsequently decide
              to withdraw your consent, please send your request to us.
            </p>

            <div className="containerCheck">
              <input className="check" type="checkbox" />
              <span className="inside"></span>

              <span className="text">
                I am informed about the processing of my personal data and the
                right to withdraw my consent.
              </span>
            </div>

            <button className="button">
              {" "}
              <span>Submit</span>{" "}
            </button>
          </form>
        </div>
      </>
    );
  }
}

export default Form;

// const  = () => {
//   // const [nameValue, setNameValue] = useState<string>("");
//   // const [emailValue, setEmailValue] = useState<string>("");
//   // const [messageValue, setMessageValue] = useState<string>("");

//   const propsDeals = {
//     dealname: `RR-WebSiite: ${nameValue}`,
//   };

//   const optionsContact = {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       origin: "http://localhost:3000/",
//       "x-requested-with": "http://localhost:3000/",
//       "X-RapidAPI-Key": "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
//       "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
//     },
//     body: JSON.stringify({ properties: propsContact }),
//   };

//   const optionsDeals = {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       origin: "http://localhost:3000/",
//       "x-requested-with": "http://localhost:3000/",
//       "X-RapidAPI-Key": "bafc83847fmsh17842a042deaad3p1c5a36jsn9bd8ac3bc8fd",
//       "X-RapidAPI-Host": "http-cors-proxy.p.rapidapi.com",
//     },
//     body: JSON.stringify({ properties: propsDeals }),
//   };

//   const ProxyUrl: string = "https://http-cors-proxy.p.rapidapi.com/";

//   const HubSpotUrl = (object: string) => {
//     return `https://api.hubapi.com/crm/v3/objects/${object}?hapikey=eu1-d8e8-5c5d-45df-8b61-f9485a1d172d`;
//   };

//   const freeFilds = () => {
//     setNameValue(" ");
//     setEmailValue(" ");
//     setMessageValue(" ");
//   };

//   const sendData = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//       let fir = fetch(`${ProxyUrl}${HubSpotUrl("contacts")}`, optionsContact)

//       let sec = fetch(`${ProxyUrl}${HubSpotUrl("deals")}`, optionsDeals)

//     const allData = Promise.all([fir , sec]);

//     return allData;

//   };

//   const sub = async (event: FormEvent<HTMLFormElement>)=>{
//     const request = await sendData(event)

//     const res1 = await request[0].json();
//     const res2 = await request[1].json();

//     console.log(res1)
//     console.log(res2)

//   }

// };

// export default Form;
