/* eslint-disable */

import React, { Component }  from 'react';
import paper from 'paper';

class Fretboard extends Component {


  constructor(props) {
      super(props);
      this.indexOf = [].indexOf;
      this.divRef = React.createRef();
      this.canvasRef = React.createRef();
      this.paper = new paper.PaperScope();
      this.lights = [];
      this.state = {
        FretboardDiv: {
            "width": 700,
            "height": 150,
            "strings": 6,
            "frets": 17,
            "start": 1,
            "start-text": null,
            "tuning": "standard"
          },
        Fretboard:{
            strings: 6,
            start_fret: 1,
            start_fret_text: null,
            end_fret: 22,
            tuning: "standard",
            color: "black",
            marker_color: "#aaa",
            marker_radius: 4,
            nut_color: "#aaa",
            nut_width: 10,
            width: 680,
            height: 110,
            x: 10,
            y: 20,
            font_color: "black",
            font_face: "Arial",
            font_size:12,
            total_frets:21
        },
        error: '',
        height: 0,
        string_spacing:0,
        fret_spacing:0,
        light_radius:0,
        changed: true,
        Drawings: {
          current: 0,
          collection: []
        },
        loginDialog: false,
      };
  }

  reset(){
    this.x = this.state.Fretboard.x;
    this.y = this.state.Fretboard.y;
    this.width = this.state.Fretboard.width;
    this.nut_width = this.state.Fretboard.nut_width;
    this.height = this.state.Fretboard.height - (this.state.Fretboard.start_fret === 0 ? 0 : 10);
    this.string_spacing = this.height / (this.state.Fretboard.strings - 1);
    this.fret_spacing = (this.state.Fretboard.width - this.state.Fretboard.nut_width) / (this.state.Fretboard.total_frets -1);
    this.total_frets = this.state.Fretboard.end_fret - this.state.Fretboard.start_fret;
    this.start_fret_text = this.state.Fretboard.start_fret_text != null ? this.state.Fretboard.start_fret_text : this.state.Fretboard.start_fret;
    this.light_radius = (this.string_spacing / 2) - 1;
    this.start_fret = this.state.Fretboard.start_fret;
    this.end_fret = this.state.Fretboard.end_fret;
    this.setState({ error: ""});
    this.calculateFretPositions();
  }

  componentDidMount() {
    this.reset();
    this.parse();
    this.paper.setup(this.canvasRef.current);
    this.draw();
    this.lightsCameraAction();
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.showFretboard){
     this.lightsCameraAction();
      if(JSON.stringify(prevProps.cursorNotes) !== JSON.stringify(this.props.cursorNotes)){
        this.addChord();
      }
    }
  }

  handleTextChange() {
    this.setState({changed: false});
  }

  handleLoginClose = () => {
    this.setState({loginDialog: false});
  };

  handleSaveButtonClick= () => {
    this.setState({loginDialog: true});
  }

  redrawFretboard(){
    this.lights = [];
    this.paper.project.activeLayer.removeChildren();
    this.paper.view.draw();
    this.reset();
    this.parse();
    this.draw();
    this.lightsCameraAction();
  }
  handleButtonClick () {
    this.redrawFretboard();
    let position = this.state.Drawings.collection.length;
    this.setState({changed: true,Drawings:{current:position,collection:[...this.state.Drawings.collection,this.divRef.current.value]}});
  }

  handlePreviousButtonClick () {
    let position = 0;
    if(this.state.Drawings.current > 0){
      //the current is the one just saved, so you want to go back one
      position = this.state.Drawings.current - 1;
    }
    this.divRef.current.value = this.state.Drawings.collection[position];
    this.redrawFretboard();
    this.setState({changed: true,Drawings:{current:position,collection:[...this.state.Drawings.collection]}});
  }

  handleNextButtonClick () {
    let position = this.state.Drawings.collection.length;
    if(this.state.Drawings.current !== this.state.Drawings.collection.length){
      //the current is the one just saved, so you want to go back one
      position = this.state.Drawings.current + 1;
    }
    this.divRef.current.value = this.state.Drawings.collection[position];
    this.redrawFretboard();
    this.setState({changed: true,Drawings:{current:position,collection:[...this.state.Drawings.collection]}});
  }


  render() {
    return (
      <>
      <p>{this.state.error}</p>
      <textarea id="fretboard-input" onChange={this.handleTextChange.bind(this)} ref={this.divRef} cols='60' rows='8' defaultValue='show frets=3,4,5,6 string=1&#13;&#10;show frets=3,4,5 string=2 color=red&#13;&#10;show fret=3 string=6 color=#0F0 fill-color=sandybrown&#13;&#10;show notes=10/1,10/2,9/3,9/4&#13;&#10;show note=0/6 text=E color=red fill-color=white text-color=blue&#13;&#10;'>
      </textarea>
      <br />
      <button className="drawPreviousFretboard" onClick={this.handlePreviousButtonClick.bind(this)} disabled={this.state.Drawings.collection.length < 2 || this.state.Drawings.current === 0}>
        Go Back thorugh Diagrams
      </button>
      <button className="drawFretboard" onClick={this.handleButtonClick.bind(this)} disabled={this.state.changed}>
        {this.state.changed ? "change text above to change the fretboard" : "click to redraw the fretboard"}
      </button>
      <button className="drawNextFretboard" onClick={this.handleNextButtonClick.bind(this)} disabled={ this.state.Drawings.current >= this.state.Drawings.collection.length - 1}>
        Go Forward through Diagrams
      </button>
    <div className={this.props.showFretboard ? "pc-Show" : "pc-Hide"}>
      <canvas id='fretboard-canvas' ref={this.canvasRef} width={this.state.FretboardDiv.width} height={this.state.FretboardDiv.height}/>
    </div>
    </>
    )     
  }
  
  calculateFretPositions() {
    var i, k, num, ref, transform, width, x;
    width = this.width - this.nut_width;
    this.bridge_to_fret = [width];
    this.fretXs = [0];
    k = 1.05946;
    for (num = i = 1, ref = this.total_frets; (1 <= ref ? i <= ref : i >= ref); num = 1 <= ref ? ++i : --i) {
      this.bridge_to_fret[num] = width / Math.pow(k, num);
      this.fretXs[num] = width - this.bridge_to_fret[num];
    }
    // We don't need the entire scale (nut to bridge), so transform
    // the X positions.
    transform = (x) => {
      return (x / this.fretXs[this.total_frets]) * width;
    };
    return this.fretXs = (function() {
      var j, len, ref1, results;
      ref1 = this.fretXs;
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        x = ref1[j];
        results.push(transform(x));
      }
      return results;
    }).call(this);
    }

    draw() {
      var i, j, num, ref, ref1, ref2;
      for (num = i = 1, ref = this.state.Fretboard.strings; (1 <= ref ? i <= ref : i >= ref); num = 1 <= ref ? ++i : --i) {
        this.drawString(num);
      }
      for (num = j = ref1 = this.start_fret, ref2 = this.end_fret; (ref1 <= ref2 ? j <= ref2 : j >= ref2); num = ref1 <= ref2 ? ++j : --j) {
        this.drawFret(num);
      }
      if (this.start_fret === 1) {
        this.drawNut();
      } else {
        this.showStartFret();
      }
      this.drawMarkers();
      return this.paper.view.draw();
    }

    drawString(num) {
      var path, start, y;
      path = new this.paper.Path();
      path.strokeColor = this.state.Fretboard.color;
      y = this.getStringY(num);
      start = new this.paper.Point(this.x, y);
      path.moveTo(start);
      return path.lineTo(start.add([this.width, 0]));
    }

    drawFret(num) {
      var path, start, x;
      path = new this.paper.Path();
      path.strokeColor = this.state.Fretboard.color;
      x = this.getFretX(num);
      start = new this.paper.Point(x, this.y);
      path.moveTo(start);
      return path.lineTo(start.add([0, this.height]));
    }

    drawNut() {
      var path;
      path = new this.paper.Path.RoundRectangle(this.x, this.y - 5, this.nut_width, this.height + 10);
      path.strokeColor = this.state.Fretboard.nut_color;
      return path.fillColor = this.state.Fretboard.nut_color;
    }

    showStartFret() {
      var center;
      center = this.getFretCenter(this.start_fret, 1);
      return this.renderText(new this.paper.Point(center.x, this.y + this.height + 20), this.start_fret_text);
    }

    getFretX(num) {
      return this.fretXs[num - (this.start_fret - 1)] + (this.start_fret > 1 ? 3 : this.nut_width);
    }

    getStringY(num) {
      return this.y + ((num - 1) * this.string_spacing);
    }

    getFretCenter(fret, string) {
      var  x, y; //end_fret, start_fret,

      if (!this.hasFret(fret)) {
        console.log(`Invalid fret: ${fret}`);
      }
      if (!this.hasString(string)) {
        console.log(`Invalid string: ${string}`);
      }
      x = 0;
      if (fret === 0) {
        x = this.getFretX(0) + (this.nut_width / 2);
      } else {
        x = (this.getFretX(fret) + this.getFretX(fret - 1)) / 2;
      }
      y = this.getStringY(string);
      return new this.paper.Point(x, y);
    }

    drawMarkers() {
      var bottom_dot, drawCircle, i, j, len, len1, middle_dot, position, ref, ref1, results, start, top_dot, y_displacement;
      middle_dot = 3;
      top_dot = 4;
      bottom_dot = 2;
      if (parseInt(this.state.Fretboard.strings, 10) === 4) {
        middle_dot = 2;
        top_dot = 3;
        bottom_dot = 1;
      }
      drawCircle = (start) => {
        var path;
        path = new this.paper.Path.Circle(start, this.state.Fretboard.marker_radius);
        path.strokeColor = this.state.Fretboard.marker_color;
        return path.fillColor = this.state.Fretboard.marker_color;
      };
      y_displacement = this.string_spacing / 2;
      ref = [3, 5, 7, 9, 15, 17, 19, 21];
      for (i = 0, len = ref.length; i < len; i++) {
        position = ref[i];
        if (this.hasFret(position)) {
          start = this.getFretCenter(position, middle_dot).add([0, y_displacement]);
          drawCircle(start);
        }
      }
      ref1 = [12, 24];
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        position = ref1[j];
        if (this.hasFret(position)) {
          start = this.getFretCenter(position, bottom_dot).add([0, y_displacement]);
          drawCircle(start);
          start = this.getFretCenter(position, top_dot).add([0, y_displacement]);
          results.push(drawCircle(start));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    hasFret(num) {
      var ref, ref1;
      return this.indexOf.call((function() {
        var results = [];
        for (var i = ref = this.start_fret - 1, ref1 = this.end_fret; ref <= ref1 ? i <= ref1 : i >= ref1; ref <= ref1 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this), num) >= 0;
    }

    hasString(num) {
      var ref;
      return this.indexOf.call((function() {
        var results = [];
        for (var i = 1, ref = this.state.Fretboard.strings; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--){ results.push(i); }
        return results; 
      }).apply(this), num) >= 0;
    }

    parse() {
      var i, len, line, lines, match;
      lines = this.divRef.current.value.split(/\r?\n/);
      for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        line.trim();
        match = line.match(/^\s*option\s+(\S+)\s*=\s*(\S+)/);
        if (match != null) {
          this.setOption(match[1], match[2]);
        }
        match = line.match(/^\s*show\s+(.+)/);
        if (match != null) {
          this.show(match[1]);
        }
      }
      return true;
    }

    show(line) {
      var i, len, match, option, options, params, ref, valid_options;
      options = line.split(/\s+/);
      params = {};
      valid_options = ["fret", "frets", "string", "strings", "text", "color", "note", "notes", "fill-color","text-color"];
      for (i = 0, len = options.length; i < len; i++) {
        option = options[i];
        match = option.match(/^(\S+)\s*=\s*(\S+)/);
        if(match === null) {
          this.setState({ error: "Invalid 'show' option: " + option});
        } else if (ref = match[1], this.indexOf.call(valid_options, ref) < 0) {
          this.setState({ error: "Invalid 'show' option: " + match[1] });
          //this.state.error = "Invalid 'show' option: " + match[1];
        }
        if (match != null) {
          params[match[1]] = match[2];
        }
      };
      return this.lights.push(params);
    }

    lightsCameraAction() {
      var i, len, light, param, params, ref, results;
      ref = this.lights;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        light = ref[i];
        params = this.extractFrets(light);
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = params.length; j < len1; j++) {
            param = params[j];
            if (light.color != null) {
              param.color = light.color;
            }
            if (light["fill-color"] != null) {
              param.fillColor = light["fill-color"];
            }
            if (light["text-color"] != null) {
              param.textColor = light["text-color"];
            }
            if (light.text != null) {
              param.text = light.text;
              results1.push(this.lightText(param));
            } else {
              results1.push(this.lightUp(param));
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    }

    extractNumbers(str) {
      str.trim();
      return str.split(/\s*,\s*/);
    };

    extractNotes(str) {
      var extracted_notes, i, len, note, notes, parts;
      str.trim();
      notes = str.split(/\s*,\s*/);
      extracted_notes = [];
      for (i = 0, len = notes.length; i < len; i++) {
        note = notes[i];
        parts = note.match(/(\d+)\/(\d+)/);
        if (parts != null) {
          extracted_notes.push({
            fret: parseInt(parts[1], 10),
            string: parseInt(parts[2], 10)
          });
        } else {
          this.setState({ error: "Invalid note: " + note});
        }
      }
      return extracted_notes;
    };

    extractFrets(light) {
      var fret, frets, i, j, l, len, len1, len2, lights, note, notes, string, strings;
      if (light.fret != null) {
        frets = this.extractNumbers(light.fret);
      }
      if (light.frets != null) {
        frets = this.extractNumbers(light.frets);
      }
      if (light.string != null) {
        strings = this.extractNumbers(light.string);
      }
      if (light.strings != null) {
        strings = this.extractNumbers(light.strings);
      }
      if (light.note != null) {
        notes = this.extractNotes(light.note);
      }
      if (light.notes != null) {
        notes = this.extractNotes(light.notes);
      }
      if ((!((frets != null) && (strings != null))) && (notes == null)) {
        this.setState({ error: "No frets or strings specified on line"});
      }
      lights = [];
      if ((frets != null) && (strings != null)) {
        for (i = 0, len = frets.length; i < len; i++) {
          fret = frets[i];
          for (j = 0, len1 = strings.length; j < len1; j++) {
            string = strings[j];
            lights.push({
              fret: parseInt(fret, 10),
              string: parseInt(string, 10)
            });
          }
        }
      }
      if (notes != null) {
        for (l = 0, len2 = notes.length; l < len2; l++) {
          note = notes[l];
          lights.push(note);
        }
      }
      return lights;
    };

    lightText(options) {
      var opts, path, point, y_displacement;
      opts = {
        color: "white",
        fillColor: "#666",
        ...options
      };
      point = this.getFretCenter(opts.fret, opts.string);
      path = new this.paper.Path.Circle(point, this.light_radius);
      path.strokeColor = opts.color;
      path.fillColor = opts.fillColor;
      y_displacement = this.string_spacing / 5;
      point.y += y_displacement;
      if (opts.text != null) {
        if (opts.textColor !== undefined) {
          this.renderText(point, opts.text, opts.textColor);
        } else {
          this.renderText(point, opts.text, opts.color);
        }
        
      }
      return this.paper.view.draw();
    }

    lightUp(options) {
      var path, point;
      if (options.color == null) {
        options.color = '#666';
      }
      if (options.fillColor == null) {
        options.fillColor = options.color;
      }
      point = this.getFretCenter(options.fret, options.string);
      path = new this.paper.Path.Circle(point, this.light_radius - 2);
      path.strokeColor = options.color;
      path.fillColor = options.fillColor;
      return this.paper.view.draw();
    }

    addChord(){
      for (let i = 0, len = this.props.cursorNotes.length; i < len; i++) {
        this.lightUp({
          fillColor: '#0F0',
          fret: this.props.cursorNotes[i][0],
          string: this.props.cursorNotes[i][1],
        })
      }
    }

    renderText(point, value, color = this.options.font_color, size = this.state.Fretboard.font_size) {
      var text;
      text = new this.paper.PointText(point);
      text.justification = "center";
      text.characterStyle = {
        font: this.state.Fretboard.font_face,
        fontSize: size,
        fillColor: color
      };
      return text.content = value;
    }
}

export default Fretboard;