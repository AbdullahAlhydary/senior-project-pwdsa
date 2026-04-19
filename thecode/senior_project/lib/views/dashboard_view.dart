// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:senior_project/l10n/app_localizations.dart';
import 'package:senior_project/models/prediction_response.dart';
import 'package:senior_project/providers/locale_provider.dart';
import 'package:senior_project/services/prediction_service.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final PredictionService _service = PredictionService();

  // Operational (kept for continuity; not sent to model)
  final TextEditingController _injectionRateController = TextEditingController();
  final TextEditingController _waterRateController = TextEditingController();

  // Petroleum parameters
  final TextEditingController _injectionPressureController = TextEditingController();
  final TextEditingController _maipController = TextEditingController();
  final TextEditingController _waterCutController = TextEditingController();

  // Reservoir / geology
  final TextEditingController _porosityController = TextEditingController();
  final TextEditingController _permeabilityController = TextEditingController();
  final TextEditingController _grssController = TextEditingController();
  String? _lithology;

  // Chemistry
  final TextEditingController _tdsController = TextEditingController();
  final TextEditingController _tssController = TextEditingController();
  final TextEditingController _oilInWaterController = TextEditingController();
  final TextEditingController _caController = TextEditingController();
  final TextEditingController _so4Controller = TextEditingController();
  final TextEditingController _baController = TextEditingController();
  final TextEditingController _srController = TextEditingController();
  final TextEditingController _phController = TextEditingController();
  final TextEditingController _tempController = TextEditingController();
  final TextEditingController _criController = TextEditingController();
  final TextEditingController _sriController = TextEditingController();

  bool _loading = false;
  PredictionResponse? _result;
  String? _error;

  @override
  void dispose() {
    for (final c in [
      _injectionRateController,
      _waterRateController,
      _injectionPressureController,
      _maipController,
      _waterCutController,
      _porosityController,
      _permeabilityController,
      _grssController,
      _tdsController,
      _tssController,
      _oilInWaterController,
      _caController,
      _so4Controller,
      _baController,
      _srController,
      _phController,
      _tempController,
      _criController,
      _sriController,
    ]) {
      c.dispose();
    }
    _service.dispose();
    super.dispose();
  }

  double _d(TextEditingController c) => double.parse(c.text);

  String? _nonNegative(String? v, AppLocalizations l) {
    if (v == null || v.isEmpty) return l.emptyValueMessage;
    final parsed = double.tryParse(v);
    if (parsed == null) return l.nonNumricalMessage;
    if (parsed < 0) return l.positiveNumberValidationMessage;
    return null;
  }

  String? _inRange(String? v, double lo, double hi, AppLocalizations l) {
    if (v == null || v.isEmpty) return l.emptyValueMessage;
    final parsed = double.tryParse(v);
    if (parsed == null) return l.nonNumricalMessage;
    if (parsed < lo || parsed > hi) {
      return l.valueBetweenValidationMessage(lo.toString(), hi.toString());
    }
    return null;
  }

  String? _anyNumber(String? v, AppLocalizations l) {
    if (v == null || v.isEmpty) return l.emptyValueMessage;
    if (double.tryParse(v) == null) return l.nonNumricalMessage;
    return null;
  }

  Widget _buildField(
    String label,
    TextEditingController controller,
    String? Function(String?) validator,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
        validator: validator,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70),
          filled: true,
          fillColor: Colors.white.withOpacity(0.06),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Colors.white),
          ),
        ),
      ),
    );
  }

  Widget _buildLithologyDropdown(AppLocalizations l) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<String>(
        initialValue: _lithology,
        dropdownColor: const Color(0xFF0A1F44),
        style: const TextStyle(color: Colors.white),
        iconEnabledColor: Colors.white70,
        decoration: InputDecoration(
          labelText: l.lithology,
          labelStyle: const TextStyle(color: Colors.white70),
          filled: true,
          fillColor: Colors.white.withOpacity(0.06),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Colors.white),
          ),
        ),
        items: [
          DropdownMenuItem(value: "carbonate", child: Text(l.lithologyCarbonate)),
          DropdownMenuItem(value: "sandstone", child: Text(l.lithologySandstone)),
          DropdownMenuItem(value: "shale", child: Text(l.lithologyShale)),
        ],
        validator: (v) => v == null ? l.selectValue : null,
        onChanged: (v) => setState(() => _lithology = v),
      ),
    );
  }

  Future<void> _onSubmit(AppLocalizations l) async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
      _result = null;
    });
    final lang = context.read<LocaleProvider>().locale.languageCode;
    final payload = <String, dynamic>{
      "water_cut_fraction": _d(_waterCutController),
      "MAIP_psi": _d(_maipController),
      "required_injection_pressure_psi": _d(_injectionPressureController),
      "porosity_fraction": _d(_porosityController),
      "permeability_md": _d(_permeabilityController),
      "TDS_mg_L": _d(_tdsController),
      "oil_in_water_ppm": _d(_oilInWaterController),
      "TSS_mg_L": _d(_tssController),
      "Ca_mg_L": _d(_caController),
      "SO4_mg_L": _d(_so4Controller),
      "Ba_mg_L": _d(_baController),
      "Sr_mg_L": _d(_srController),
      "CRI": _d(_criController),
      "SRI": _d(_sriController),
      "lithology": _lithology ?? "sandstone",
      "pH": _d(_phController),
      "temperature_C": _d(_tempController),
      "GRSS": _d(_grssController),
      "language": lang,
    };
    try {
      final result = await _service.predict(payload);
      if (!mounted) return;
      setState(() => _result = result);
    } on PredictionException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _cardWrap(Widget child) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
      ),
      child: child,
    );
  }

  Widget _sectionTitle(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          s,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final language = AppLocalizations.of(context)!;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF050F2C), Color(0xFF0A1F44), Color(0xFF112D4E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                Text(
                  language.provideData,
                  style: const TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 16),
                _cardWrap(Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionTitle("Injection & Water"),
                    _buildField("Injection Pressure (psi) (≥ 0)", _injectionPressureController,
                        (v) => _nonNegative(v, language)),
                    _buildField("Injection Rate (bbl/day) (≥ 0)", _injectionRateController,
                        (v) => _nonNegative(v, language)),
                    _buildField(
                        "MAIP (psi) (≥ 0)", _maipController, (v) => _nonNegative(v, language)),
                    _buildField("Water Rate (bbl/day) (≥ 0)", _waterRateController,
                        (v) => _nonNegative(v, language)),
                    _buildField("Water Cut (0 - 1)", _waterCutController,
                        (v) => _inRange(v, 0, 1, language)),
                  ],
                )),
                const SizedBox(height: 14),
                _cardWrap(Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionTitle(language.formationProperties),
                    _buildLithologyDropdown(language),
                    _buildField("Porosity (0 - 1)", _porosityController,
                        (v) => _inRange(v, 0, 1, language)),
                    _buildField("Permeability (mD) (≥ 0)", _permeabilityController,
                        (v) => _nonNegative(v, language)),
                    _buildField(
                        "GRSS (0 - 100)", _grssController, (v) => _inRange(v, 0, 100, language)),
                    _buildField("Temperature (°C)", _tempController,
                        (v) => _anyNumber(v, language)),
                  ],
                )),
                const SizedBox(height: 14),
                _cardWrap(Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionTitle("Water Chemistry"),
                    _buildField("TDS (mg/L) (≥ 0)", _tdsController,
                        (v) => _nonNegative(v, language)),
                    _buildField("TSS (mg/L) (≥ 0)", _tssController,
                        (v) => _nonNegative(v, language)),
                    _buildField("Oil in Water (ppm) (≥ 0)", _oilInWaterController,
                        (v) => _nonNegative(v, language)),
                    _buildField(
                        "pH (0 - 14)", _phController, (v) => _inRange(v, 0, 14, language)),
                    _buildField("Calcium (Ca) (mg/L) (≥ 0)", _caController,
                        (v) => _nonNegative(v, language)),
                    _buildField("Sulfate (SO₄) (mg/L) (≥ 0)", _so4Controller,
                        (v) => _nonNegative(v, language)),
                    _buildField("Barium (Ba) (mg/L) (≥ 0)", _baController,
                        (v) => _nonNegative(v, language)),
                    _buildField("Strontium (Sr) (mg/L) (≥ 0)", _srController,
                        (v) => _nonNegative(v, language)),
                    _buildField("CRI", _criController, (v) => _anyNumber(v, language)),
                    _buildField("SRI", _sriController, (v) => _anyNumber(v, language)),
                  ],
                )),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _loading ? null : () => _onSubmit(language),
                    child: _loading
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              ),
                              const SizedBox(width: 12),
                              Text(language.predicting),
                            ],
                          )
                        : Text(language.showResults),
                  ),
                ),
                const SizedBox(height: 20),
                if (_error != null)
                  _cardWrap(Text(
                    language.predictionFailed(_error!),
                    style: const TextStyle(color: Colors.redAccent),
                  )),
                if (_result != null) _buildResult(language, _result!),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResult(AppLocalizations l, PredictionResponse r) {
    final probEntries = r.probabilities.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return _cardWrap(Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "${l.results}:",
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 10),
        Text(
          "${l.recommendedDecision}: ${r.decision}",
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "${l.confidence}: ${(r.confidence * 100).toStringAsFixed(1)}%",
          style: const TextStyle(color: Colors.white70),
        ),
        const SizedBox(height: 10),
        Text(
          r.summary,
          style: const TextStyle(fontSize: 14, color: Colors.white70),
        ),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "${l.probabilities}:",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              ...probEntries.map(
                (e) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: Text(e.key,
                            style: const TextStyle(color: Colors.white70)),
                      ),
                      Expanded(
                        flex: 5,
                        child: LinearProgressIndicator(
                          value: e.value.clamp(0.0, 1.0),
                          minHeight: 6,
                          backgroundColor: Colors.white12,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text("${(e.value * 100).toStringAsFixed(1)}%",
                          style: const TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Text(
          l.modelInfo(r.modelName),
          style: const TextStyle(color: Colors.white38, fontSize: 11),
        ),
      ],
    ));
  }
}
