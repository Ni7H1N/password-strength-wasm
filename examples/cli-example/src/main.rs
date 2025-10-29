use pwd_strength::{evaluate, breach::check_pwned};
use serde_json::to_string_pretty;
use std::env;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: pwd-cli <password>");
        std::process::exit(1);
    }

    let pwd = &args[1];
    let mut result = evaluate(pwd);

    // Call breach lookup
    if let Some(count) = check_pwned(pwd).await {
        result.is_pwned = Some(count > 0);
        if count > 0 {
            result.feedback.push(format!("⚠️ Appears in {} breaches!", count));
        }
    }

    println!("{}", to_string_pretty(&result).unwrap());
}
