//! pwd_strength - minimal starter implementation
//!
//! Public API:
//! - evaluate(password: &str) -> StrengthResult

pub mod breach;
mod entropy;
mod pattern;

use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Debug)]
pub struct StrengthResult {
    pub score: u8, // 0..4
    pub entropy_bits: f64,
    pub feedback: Vec<String>,
    pub is_pwned: Option<bool>,
}

pub fn evaluate(password: &str) -> StrengthResult {
    let entropy = entropy::estimate_shannon_bits(password);
    let mut feedback = Vec::new();

    if password.len() < 9 {
        feedback.push(format!("password length is {}, recommended minimum is 9", password.len()));
    }

    // pattern checks
    if pattern::has_repeated_chars(password) {
        feedback.push("repeated characters detected".to_string());
    }
    if pattern::is_keyboard_spatial(password) {
        feedback.push("keyboard spatial pattern detected".to_string());
    }

    // naive scoring mapping from entropy
    let score = if entropy < 28.0 {
        0
    } else if entropy < 36.0 {
        1
    } else if entropy < 60.0 {
        2
    } else if entropy < 90.0 {
        3
    } else {
        4
    };

    StrengthResult {
        score,
        entropy_bits: entropy,
        feedback,
        is_pwned: None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_basic() {
        let r = evaluate("password");
        assert!(r.entropy_bits >= 0.0);
    }
}

// -------------------------------------------------------------------------
// ✅ WASM bindings section
// -------------------------------------------------------------------------
#[wasm_bindgen]
pub fn estimate_strength(password: &str) -> JsValue {
    let result = evaluate(password);
    JsValue::from_serde(&result).unwrap()
}
